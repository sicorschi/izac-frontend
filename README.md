# Izac Frontend + Kubernetes Cluster Guide

This project is the Angular frontend for the Izac system. It is built with Angular 21, packaged into a Docker image, and deployed in a k3s cluster alongside a backend API and a database.

This README explains the cluster architecture, the roles of each component, the necessary Kubernetes resources, how the frontend and backend communicate, what the important files are, how to monitor and manage the cluster, and what to consider when scaling or exposing services.

---

## 1. What is a k3s cluster in this project?

A k3s cluster is a Kubernetes environment that runs your application as containers managed by the Kubernetes control plane and worker nodes.

In this project, the cluster contains at least these major pieces:

- Frontend: Angular application
- Backend: NestJS or similar API service
- Database: MariaDB/MySQL-style database running inside the cluster
- Networking: Services and optionally Ingress
- Storage/configuration: ConfigMaps, Secrets, environment files, and image builds

The cluster is not just a single machine. It is a group of nodes that run Pods, and Kubernetes decides where those Pods should run.

### Basic cluster terminology

- Node: a machine in the cluster (VM or bare metal host)
- Pod: the smallest deployable unit; usually one container or a few tightly related containers
- Deployment: a declarative way to run and scale a set of Pods
- Service: gives a stable network address to a set of Pods
- Ingress: exposes HTTP/HTTPS routes from outside the cluster to services inside it
- ConfigMap: stores non-secret configuration values
- Secret: stores sensitive configuration such as passwords and tokens
- Image: a packaged application container you build and deploy

---

## 2. What pods are running in the cluster?

In your current setup, the important workloads are conceptually:

- frontend pod: serves the Angular application
- backend pod: serves the API
- database pod: MariaDB

The names you have been using are similar to:

- frontend namespace/project app
- backend service: `izac-backend`
- database service: `mariadb`
- namespace: `izac`

The important idea is that the backend and database usually live in a private network inside the cluster, while the browser can only reach the app through an external-facing Service or Ingress.

### Why this matters

The browser is outside the cluster. It cannot resolve your cluster-internal DNS names such as:

```txt
http://izac-backend.izac.svc.cluster.local:3001/api/v1
```

That address works only from inside the cluster.

The browser must use:

- node IP + NodePort
- a LoadBalancer
- or an Ingress hostname

---

## 3. Frontend application details

This repository contains the Angular frontend app.

### Important files in this repository

#### Dockerfile

The project uses a multi-stage Docker build:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/izac-frontend/browser /usr/share/nginx/html
EXPOSE 80
```

Why this is necessary:

- The first stage installs dependencies and builds the Angular app for production
- The second stage uses Nginx to serve the static files
- This is the standard pattern for deploying Angular builds in Kubernetes

#### src/environments/environment.prod.ts

This file contains the production API endpoint:

```ts
export const environment = {
  production: true,
  apiUrl: 'http://192.168.0.50:30001/api/v1',
};
```

Why this is necessary:

- Angular is a frontend app; it does not talk directly to the database
- It calls the backend through the API URL
- In production, this must point to a browser-reachable address, not a cluster-only DNS name

#### package.json

The app is built with Angular CLI and uses production build scripts.

```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  }
}
```

### What the frontend pod does

- serves static Angular files
- executes in the browser on the client side
- calls the backend API using `apiUrl`
- usually does not need direct database access

### Typical frontend deployment flow

1. run `npm ci`
2. run production Angular build
3. package static files into a Docker image
4. deploy the image to a Pod in Kubernetes
5. expose it via Service/Ingress

---

## 4. Backend application details

The backend is the API layer that receives requests from the frontend and communicates with the database.

### What the backend does

- exposes REST endpoints such as `/api/v1/sensors`, `/api/v1/devices`
- validates requests
- processes business logic
- talks to the database
- returns JSON to the frontend

### Why the backend needs a Service

A Pod is ephemeral. It can restart and get a different IP address. A Kubernetes Service gives it a stable name and a stable internal endpoint.

Example internal service address:

```txt
http://izac-backend.izac.svc.cluster.local:3001
```

This is valid inside the cluster, but not from the browser.

### Required backend configuration

In your setup, the backend needed values like:

- `API_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_NAME`
- `DB_PASSWORD`
- `DB_SYNCHRONIZE`
- `DB_LOGGING`
- `JWT_SECRET`

These are typically supplied through:

- ConfigMap for non-secret values
- Secret for password/token values

This is necessary because the backend should not hardcode secrets in source code.

---

## 5. Database details

The database is the persistent data layer.

In your case, it is MariaDB running in the cluster.

### Why the database is separate

- it stores application data
- it is independent from the API pod
- the API connects to it through the service name or cluster-local address
- the database should not be directly exposed to the browser

### Typical connection inside the cluster

Example:

```txt
mariadb.izac.svc.cluster.local
```

or sometimes the app uses the internal service name directly as the DB host.

### Why this is required

The frontend should never talk to the DB directly. The DB must remain private. Only the backend should access it.

---

## 6. Kubernetes resources you need to understand

### Pod

A Pod is the runtime unit for a container.

Example conceptually:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: izac-backend
  namespace: izac
spec:
  containers:
    - name: backend
      image: your-backend-image:tag
      ports:
        - containerPort: 3001
```

Use Pods directly only for simple testing. For production, Deployments are preferred.

### Deployment

A Deployment manages ReplicaSets and ensures the desired number of Pods exists.

Example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: izac-backend
  namespace: izac
spec:
  replicas: 2
  selector:
    matchLabels:
      app: izac-backend
  template:
    metadata:
      labels:
        app: izac-backend
    spec:
      containers:
        - name: izac-backend
          image: your-backend-image:tag
          ports:
            - containerPort: 3001
```

Why it's necessary:

- self-healing
- rollout support
- easy scaling
- stable management of app replicas

### Service

A Service gives Pods a stable endpoint.

Example:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: izac-backend
  namespace: izac
spec:
  selector:
    app: izac-backend
  ports:
    - port: 3001
      targetPort: 3001
      protocol: TCP
```

This is ClusterIP by default, which is internal-only. For browser access, you need NodePort, LoadBalancer, or Ingress.

### NodePort

NodePort exposes a service on each node IP.

Example:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: izac-backend
  namespace: izac
spec:
  type: NodePort
  selector:
    app: izac-backend
  ports:
    - port: 3001
      targetPort: 3001
      nodePort: 30001
```

This allows access through:

```txt
http://<node-ip>:30001
```

This is what solved the browser access problem in your setup.

### LoadBalancer

A LoadBalancer creates an external IP that routes traffic to the service.

Useful when running in cloud-managed Kubernetes clusters.

### Ingress

Ingress is the more common production solution for HTTP routing.

Example:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: izac-ingress
  namespace: izac
spec:
  rules:
    - host: api.izac.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: izac-backend
                port:
                  number: 3001
```

Why this is necessary:

- centralizes external HTTP routing
- gives you hostnames like `api.izac.com`
- cleaner than exposing raw NodePorts
- easier to add TLS and routing rules

---

## 7. Why the frontend and backend cannot both use the same URL

This was one of the main issues in your debugging.

### Internal communication

The frontend Pod can talk to the backend service using a cluster DNS name.

Example:

```txt
http://izac-backend.izac.svc.cluster.local:3001/api/v1
```

This is valid from inside the cluster.

### Browser communication

The browser is outside the cluster and cannot resolve internal Kubernetes DNS names.

It must use a NodePort, LoadBalancer, or Ingress hostname.

That is why the frontend `environment.prod.ts` needed to use a public node IP and port, such as:

```txt
http://192.168.0.50:30001/api/v1
```

---

## 8. Service exposure and the "why" behind the fix

Your backend service was originally:

```yaml
type: ClusterIP
```

That means:

- only workloads inside the cluster can access it
- the browser cannot reach it
- it is used for internal app-to-app communication

When changed to:

```yaml
type: NodePort
```

the app became reachable on the node IP and port, which allows browser access.

This is the important distinction:

- `ClusterIP` = internal only
- `NodePort` = reachable from outside the cluster via node IP
- `LoadBalancer` = cloud-managed external IP
- `Ingress` = hostname-based routing and production-friendly entry point

---

## 9. Images used in the deployment

The frontend image is built from the project in this repo.

Project image pattern:

```txt
izac-frontend:latest
```

The backend image is built separately and pushed to a registry. It usually follows a pattern like:

```txt
your-registry/izac-backend:latest
```

The database uses a MariaDB image, typically:

```txt
mariadb:10.11
```

or another compatible MariaDB image version.

### Why image names matter

Kubernetes does not deploy source code directly. It deploys container images.

So each service must have a valid container image and tag.

---

## 10. Necessary configuration files and resources

### Frontend project files

- `Dockerfile`: builds Angular app and serves it with Nginx
- `src/environments/environment.prod.ts`: production API URL
- `angular.json`: Angular build settings

### Kubernetes resources

- Deployment: runs the frontend/backend pods
- Service: exposes the pods
- Ingress: routes external traffic to the backend/frontend
- ConfigMap: stores environment config
- Secret: stores credentials and secrets
- PersistentVolume or StatefulSet (for DB storage if needed): keeps database data safe across restarts

### Example backend configuration pattern

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: izac-backend-config
  namespace: izac
data:
  API_PORT: '3001'
  DB_HOST: 'mariadb'
  DB_PORT: '3306'
  DB_NAME: 'izac'
  DB_SYNCHRONIZE: 'true'
  DB_LOGGING: 'false'
---
apiVersion: v1
kind: Secret
metadata:
  name: izac-backend-secret
  namespace: izac
type: Opaque
stringData:
  DB_USERNAME: 'root'
  DB_PASSWORD: 'your-password'
  JWT_SECRET: 'your-jwt-secret'
```

Why these are necessary:

- the backend cannot assume a fixed local environment
- the database host, credentials, and port may vary between local, staging, and production
- Kubernetes configuration should be externalized from the container image

---

## 11. How to organize your cluster

A good production organization is:

- separate namespace per application or environment
- one namespace for backend and database, such as `izac`
- one frontend namespace or deployment if needed
- use ConfigMaps and Secrets instead of hardcoded values
- run at least 2 replicas for critical services
- add health checks and readiness probes
- keep DB data in persistent storage

### Example logical layout

```txt
cluster
├── namespace: izac
│   ├── frontend deployment
│   ├── backend deployment
│   ├── database deployment/service
│   ├── configmap
│   ├── secret
│   └── ingress
└── optional namespace: monitoring
```

---

## 12. How to scale your services

Scaling means increasing or decreasing the number of Pod replicas.

### Scale a deployment

```bash
sudo k3s kubectl scale deployment izac-backend -n izac --replicas=2
sudo k3s kubectl scale deployment izac-frontend -n izac --replicas=2
```

### Or update deployment manifest

```yaml
spec:
  replicas: 3
```

Why scale matters:

- more frontends = more concurrent UI serving capacity
- more backends = more API throughput
- database may need high availability depending on workload

### Considerations

- scale the app before scaling the database
- do not scale a DB blindly without checking storage and replication strategy
- use readiness/liveness probes to avoid routing traffic to unhealthy Pods

---

## 13. Monitoring and troubleshooting commands

These are the most useful commands for managing a k3s cluster.

### Check cluster status

```bash
sudo k3s kubectl get nodes
sudo k3s kubectl get pods -A
sudo k3s kubectl get svc -A
sudo k3s kubectl get ingress -A
```

### Check workload details

```bash
sudo k3s kubectl -n izac get pods
sudo k3s kubectl -n izac describe pod <pod-name>
sudo k3s kubectl -n izac logs <pod-name>
```

### Check service endpoints

```bash
sudo k3s kubectl -n izac get svc
sudo k3s kubectl -n izac get endpoints
```

### Inspect deployments

```bash
sudo k3s kubectl -n izac get deployments
sudo k3s kubectl -n izac rollout status deployment/izac-backend
```

### Restart or recreate a deployment

```bash
sudo k3s kubectl -n izac rollout restart deployment/izac-backend
sudo k3s kubectl -n izac get pods -w
```

### Remove and recreate a broken deployment

```bash
sudo k3s kubectl -n izac delete deployment izac-backend
```

Then reapply the manifest.

### Test network inside the cluster from a Pod

```bash
sudo k3s kubectl -n izac exec -it <frontend-pod-name> -- sh
curl http://izac-backend.izac.svc.cluster.local:3001/api/v1
```

This confirms the internal communication path.

### Test browser-accessible route

```bash
curl -i http://192.168.0.50:30001/api/v1
```

This is the external route a browser uses.

---

## 14. Definitions: pods, nodes, services, images, and deployments

### Pod

A single runtime unit; it contains one or more containers that share network and storage.

### Node

A host that runs Pods. Kubernetes schedules Pods across nodes.

### Deployment

A managed definition that keeps a desired number of Pods running.

### Service

A stable network identity that routes to a set of Pods.

### Ingress

An HTTP/HTTPS entry point that exposes services via hostnames and paths.

### ConfigMap

A Kubernetes object for configuration data.

### Secret

A Kubernetes object for sensitive data.

### Image

A packaged container built from source code and dependencies.

### ReplicaSet

The mechanism a Deployment uses to maintain the target number of Pods.

### Namespace

A logical boundary inside a cluster.

---

## 15. Special considerations for this project

### 1. Browser and cluster networking are different

This is the most important concept in your debugging. If it works from a Pod but not from the browser, the problem is almost always external networking, not the app itself.

### 2. Do not expose the DB directly

The database should typically stay private inside the cluster. Only the backend should connect to it.

### 3. Use environment-aware configuration

Your Angular app should use different API URLs for development and production. This is why `environment.ts` and `environment.prod.ts` matter.

### 4. Never hardcode secrets in the image

Passwords, JWT secrets, and DB credentials should be passed via Secret or environment variables at runtime.

### 5. Use health checks and readiness probes

This helps Kubernetes decide when a Pod is healthy enough to receive traffic.

### 6. Always manage upgrades via Deployments

Do not hand-edit running Pods. Update manifests and roll out the Deployment.

---

## 16. What we learned in practice

This project taught a very important lesson: the application works in layers, and each layer has a different network boundary.

### Layer 1: Browser -> Frontend

The browser loads the Angular app from the frontend service or ingress.

Example flow:

```txt
Browser
  -> http://192.168.0.50:30080 or frontend ingress host
  -> Frontend Pod/Nginx
  -> Angular static app loads in the browser
```

### Layer 2: Frontend -> Backend API

The frontend does not hit the database. It calls the backend API over HTTP.

Example:

```txt
Frontend JS in browser
  -> http://192.168.0.50:30001/api/v1/devices
  -> NodePort or LoadBalancer Service
  -> Backend Pod
```

The important configuration is the `apiUrl` in `environment.prod.ts`.

### Layer 3: Backend -> Database

The backend connects to MariaDB using the configured DB host, port, username, and password.

Example:

```txt
Backend Pod
  -> mariadb.izac.svc.cluster.local:3306
  -> MariaDB Pod
  -> SQL queries execute
```

This part is private to the cluster. The browser should never directly connect to the database.

### The key debugging insight

If the backend works from inside the cluster but the browser fails, then the problem is probably not the backend itself. The problem is usually:

- wrong external URL
- wrong service type
- missing ingress/NodePort exposure
- CORS policy
- DNS resolution
- incorrect environment file value

---

## 17. Communication flow between the app layers

This is the real traffic flow in the current cluster design.

```txt
User in browser
  -> frontend URL
  -> frontend Pod (Angular + Nginx)
  -> backend API URL (external service route)
  -> backend Service
  -> backend Pod
  -> MariaDB service / DB host
  -> database Pod
  -> result returned back to the frontend
  -> JSON displayed in Angular UI
```

### Why each hop matters

- Frontend is the UI layer
- Backend is the API layer
- Database is the persistence layer
- Service objects connect the layers while keeping the individual Pods replaceable
- The browser only sees the frontend and the externally exposed API route

### Example internal route

Inside the cluster, the backend may be reached as:

```txt
http://izac-backend.izac.svc.cluster.local:3001/api/v1
```

### Example external route

From the browser, the route must be reachable externally:

```txt
http://192.168.0.50:30001/api/v1
```

This is the exact distinction that caused the confusion earlier.

---

## 18. Troubleshooting guide for this architecture

### Symptom: frontend loads but API calls fail

Likely causes:

- wrong `apiUrl` in `environment.prod.ts`
- backend service is `ClusterIP`
- backend pod is not ready
- backend is crashing
- CORS is blocking requests
- ingress route is wrong or not configured

What to check:

```bash
sudo k3s kubectl -n izac get pods
sudo k3s kubectl -n izac get svc
sudo k3s kubectl -n izac logs deployment/izac-backend
```

### Symptom: backend pod keeps restarting

Likely causes:

- missing environment variables
- DB host is wrong
- DB connection times out
- secret is missing or invalid
- app exits because of startup error

What to check:

```bash
sudo k3s kubectl -n izac describe pod <backend-pod>
sudo k3s kubectl -n izac logs <backend-pod>
```

### Symptom: database connection fails

Likely causes:

- wrong `DB_HOST`
- wrong `DB_PORT`
- wrong user/password
- DB service is not ready yet
- DB pod is not running

What to check:

```bash
sudo k3s kubectl get pods -A
sudo k3s kubectl -n izac get svc
sudo k3s kubectl -n izac logs <db-pod>
```

### Symptom: browser cannot resolve internal Kubernetes DNS

This is the exact issue we saw.

The browser is not inside the cluster, so it cannot resolve addresses like:

```txt
izac-backend.izac.svc.cluster.local
```

Use either:

- NodePort
- LoadBalancer
- Ingress host

Not the internal cluster DNS.

### Symptom: CORS error in browser

Usually caused by the backend not allowing the frontend origin.

The backend must allow the frontend domain or origin, and in some cases also respond correctly to OPTIONS preflight requests.

Typical fix:

- enable CORS in NestJS or Express
- allow the frontend origin
- allow the required methods and headers
- make sure browser preflight requests are handled

### Symptom: service exists but no traffic reaches the pod

Check:

```bash
sudo k3s kubectl -n izac get endpoints
sudo k3s kubectl -n izac describe svc izac-backend
```

This tells you whether the Service selector matches the Pod labels.

---

## 19. Practical deployment checklist

Use this sequence whenever you deploy or redeploy the app.

### 1. Build the frontend image

```bash
npm ci
npm run build -- --configuration production
```

### 2. Build the Docker image

```bash
docker build -t izac-frontend:latest .
```

### 3. Push or load the image into your cluster environment

Depending on your setup:

```bash
docker push <registry>/izac-frontend:latest
```

or use a local image with your node environment.

### 4. Apply backend config and secrets

```bash
sudo k3s kubectl -n izac apply -f backend-config.yaml
sudo k3s kubectl -n izac apply -f backend-secret.yaml
```

### 5. Apply database and app resources

```bash
sudo k3s kubectl -n izac apply -f mariadb.yaml
sudo k3s kubectl -n izac apply -f backend.yaml
sudo k3s kubectl -n izac apply -f frontend.yaml
```

### 6. Verify pods and services

```bash
sudo k3s kubectl -n izac get pods
sudo k3s kubectl -n izac get svc
```

### 7. Test internal and external access

```bash
curl http://izac-backend.izac.svc.cluster.local:3001/api/v1
curl http://192.168.0.50:30001/api/v1
```

### 8. Update frontend environment if needed

```ts
export const environment = {
  production: true,
  apiUrl: 'http://192.168.0.50:30001/api/v1',
};
```

### 9. Rebuild and redeploy the frontend

```bash
npm run build -- --configuration production
```

Then rebuild the Docker image and redeploy.

---

## 20. Recommended production direction

For a real production setup, the preferred architecture is:

- frontend deployed as a static service or small web server
- backend deployed as a Deployment + ClusterIP or Internal service
- ingress routing external HTTP traffic to the frontend and API
- database in a separate private service or StatefulSet
- secrets managed securely
- persistent storage for database state

For local or small lab setups, NodePort is acceptable and easy to debug, but Ingress is more scalable and cleaner in production.

---

## 21. Future step: Mosquitto and MQTT in the cluster

The next natural evolution of this project is adding MQTT for device communication. MQTT is commonly used for sensors, controllers, gateways, and event streaming.

In your case, the idea is:

- devices or gateways publish to a topic
- the backend subscribes to the same topic
- the backend stores or processes the values
- the Angular frontend consumes the API results

This gives you a clean separation between:

- real-time telemetry via MQTT
- persistent state via the database
- user-facing data via REST/HTTP

### Recommended architecture for MQTT

There are two realistic ways to run Mosquitto:

#### Option A: run Mosquitto inside the Kubernetes cluster (recommended for a Kubernetes-first architecture)

This is usually the cleaner option if you want everything managed via Kubernetes and the backend is already inside the cluster.

Typical internal address:

```txt
mqtt://mosquitto.izac.svc.cluster.local:1883
```

This is ideal when:

- the backend is already deployed in the cluster
- the MQTT clients are also cluster-aware or reachable from the same LAN
- you want a single place to manage infrastructure and networking

##### Recommended Service for this option

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mosquitto
  namespace: izac
spec:
  selector:
    app: mosquitto
  ports:
    - name: mqtt
      port: 1883
      targetPort: 1883
      protocol: TCP
```

If you need to expose MQTT to local devices outside the cluster, use a NodePort or a dedicated network route:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mosquitto
  namespace: izac
spec:
  type: NodePort
  selector:
    app: mosquitto
  ports:
    - name: mqtt
      port: 1883
      targetPort: 1883
      nodePort: 31883
      protocol: TCP
```

This means devices on the LAN can reach the broker through:

```txt
mqtt://192.168.0.50:31883
```

#### Option B: run Mosquitto directly on the master Raspberry Pi

This is better when:

- the MQTT devices are physically close to the Raspberry Pi
- the node acts as an edge gateway or industrial controller
- you want the lowest-latency and simplest local connectivity
- you do not want the broker to depend on Kubernetes networking

This is often the best choice for "things on the same LAN" scenarios because the devices can publish directly to the Pi without going through the cluster network.

### My recommendation for your project

For your current setup, I would suggest this decision rule:

- If Mosquitto is mainly an internal app service used by the backend and other cluster workloads, install it in Kubernetes as a dedicated Pod/Service.
- If Mosquitto is mainly a device-facing broker for physical sensors or Raspberry Pi gateways on the same network, install it directly on the master RPi.

For a system where the API and the broker are tightly connected, a Kubernetes-hosted broker is usually cleaner and easier to manage long term.

For a real edge/IoT deployment, a hybrid approach is often best:

- Mosquitto runs on the Raspberry Pi edge node for local device connectivity
- the backend in Kubernetes subscribes to the broker through the LAN or a routed connection
- the API converts MQTT messages into application data and writes them to the database

This gives you low latency at the edge while keeping the main application logic within Kubernetes.

### Best practice: API should talk to the broker through a client library

The API should not manually manage raw sockets in the application flow. Instead:

- create one MQTT client service in the backend
- connect once at startup
- subscribe to the topics your devices publish to
- handle reconnection and health checks
- forward incoming messages to the database or application logic
- publish responses or commands when needed

This keeps your backend logic clean and avoids coupling your REST endpoints directly to broker internals.

### Recommended MQTT topics structure

Use a clear topic hierarchy such as:

```txt
izac/devices/{deviceId}/status
izac/devices/{deviceId}/sensor/{sensorName}
izac/devices/{deviceId}/command
izac/system/heartbeat
izac/system/alerts
```

This makes it easier to:

- route messages by device
- filter and monitor traffic
- debug sensor data
- add new devices without breaking the protocol

### Recommended communication pattern

The cleanest pattern is:

- sensors and devices publish to MQTT topics
- the NestJS backend subscribes to those topics
- the backend processes the payload and stores it in MariaDB
- the frontend queries the backend through REST APIs

So the flow becomes:

```txt
Devices / gateways -> MQTT broker -> backend API -> MariaDB
                              ^
                              |
                        backend publishes commands / control events
```

This is a very common and scalable design for IoT systems.

### 3. Concrete deployment recommendation for this project

For your Izac system, the best way to understand the design is to separate the responsibilities:

1. MQTT is for real-time device communication
2. the backend is the logic and orchestration layer
3. MariaDB is the persistence layer
4. the frontend is the visualization layer

A practical architecture for your project is:

```txt
IoT devices / sensors
        |
        v
Mosquitto broker (inside cluster OR on master Pi)
        |
        v
NestJS backend API
        |\
        | \-- stores historical data in MariaDB
        |
        +-- publishes control messages back to devices
        |
        v
Angular frontend
        |
        v
Browser UI
```

#### Why this is the correct design

- MQTT is designed for low-overhead, event-driven communication
- HTTP REST is designed for request/response communication between browser and backend
- the database is for durable storage, not real-time messaging
- the backend is the place where you translate MQTT events into application state

In other words:

- devices speak MQTT
- the backend speaks MQTT and HTTP
- the database stores the results
- the frontend consumes the database data through the REST API

#### Recommended implementation in your project

If your system is mostly cluster-based and you want everything centralized, the most practical choice is:

- run Mosquitto as a Kubernetes Pod in the same namespace as the backend
- expose a `Service` for internal access inside the cluster
- optionally add a `NodePort` for local LAN access if some devices are outside the cluster
- let the backend subscribe to the topics and persist messages into the DB

This gives you a cleaner cluster model because the backend and broker are managed as part of the same platform.

#### When the Raspberry Pi is better

Run Mosquitto directly on the master Raspberry Pi when:

- devices are physically close to the Pi
- the Pi is acting as the edge gateway
- low-latency local MQTT communication is more important than cluster centralization
- you want the simplest setup without depending on Kubernetes networking

In that case, the flow becomes:

```txt
Sensors -> Pi Mosquitto -> Backend in cluster (via LAN/IP) -> MariaDB
```

This is common in edge IoT systems.

#### The best rule to use

- If the broker is mainly for internal app integration: put it in k3s
- If the broker is mainly for edge devices and local hardware: put it on the Pi
- If you need both: use the Pi as the local gateway and let the backend in Kubernetes consume the stream

This gives you the best of both worlds: edge locality and cluster management.

### Security considerations for Mosquitto

When adding MQTT, always consider:

- use a username/password or certificates for client auth
- disable anonymous access in production
- separate topic permissions per device or app role
- keep MQTT traffic on a trusted LAN or VPN when possible
- do not expose the broker publicly unless necessary
- use TLS/SSL on port 8883 for production environments

### Example Mosquitto container image

```txt
eclipse-mosquitto:2
```

A minimal config file usually contains:

```conf
persistence true
persistence_location /mosquitto/data/
log_dest stdout

listener 1883
allow_anonymous false
password_file /mosquitto/config/passwd
```

This can be mounted via a ConfigMap or a secret file.

---

## 22. Short summary of your current working architecture

In your cluster, the architecture is effectively:

- frontend Angular app runs in a Pod and is served by Nginx
- backend API runs in another Pod and connects to MariaDB
- DB runs in its own Pod/service and is not exposed to the browser
- the backend service was initially internal only (`ClusterIP`)
- it was changed to a browser-reachable form (`NodePort` / external exposure)
- the frontend production build was updated to hit the reachable API URL

This is exactly the pattern needed for a Kubernetes-based full-stack app.

---

## 23. Useful command cheat sheet

```bash
# list everything
sudo k3s kubectl get all -A

# list pods in a namespace
sudo k3s kubectl -n izac get pods

# list services
sudo k3s kubectl -n izac get svc

# show logs
sudo k3s kubectl -n izac logs deploy/izac-backend

# restart deployment
sudo k3s kubectl -n izac rollout restart deploy/izac-backend

# scale deployment
sudo k3s kubectl -n izac scale deploy/izac-backend --replicas=3

# describe a pod
sudo k3s kubectl -n izac describe pod <pod-name>

# test service from inside cluster
curl http://izac-backend.izac.svc.cluster.local:3001/api/v1

# test external route
curl http://192.168.0.50:30001/api/v1

# test MQTT broker inside cluster
nc -vz mosquitto.izac.svc.cluster.local 1883
```

---

## 24. Final note

Kubernetes adds a layer of network abstraction that is extremely useful, but it also introduces the concept that internal service names and browser URLs are not the same thing.

The major lesson from this project is:

- cluster-internal communication uses service DNS
- browser access requires external addressing
- the frontend and backend must be designed with that distinction in mind
- MQTT is a separate communication layer that can sit alongside HTTP and DB persistence

That is why the correct setup includes:

- a backend API deployment
- a service for the API
- a database service or internal host
- a browser-reachable frontend URL
- proper secret/config separation
- a way to inspect and manage the running system with kubectl
- a clear MQTT broker strategy when the project grows to sensors and live data

This is the core architecture you will continue to use as your cluster grows.
