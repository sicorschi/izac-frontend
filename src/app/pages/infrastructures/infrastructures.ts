import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface InfrastructureMetric {
  label: string;
  value: string;
  delta: string;
  accent: 'blue' | 'green' | 'amber' | 'purple';
  icon: string;
}

interface InfraDevice {
  name: string;
  type: string;
  status: 'online' | 'warning' | 'offline';
  role: string;
}

interface InfraSensor {
  name: string;
  type: string;
  value: string;
  status: 'online' | 'warning' | 'offline';
}

interface ProtocolItem {
  name: string;
  detail: string;
  status: 'enabled' | 'monitoring' | 'warning';
}

@Component({
  selector: 'app-infrastructures',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './infrastructures.html',
  styleUrls: ['./infrastructures.css'],
})
export class InfrastructuresComponent {
  metrics: InfrastructureMetric[] = [
    { label: 'Active infra', value: '12', delta: '+2 this month', accent: 'blue', icon: 'hub' },
    { label: 'Connected devices', value: '248', delta: '+12.4%', accent: 'green', icon: 'devices' },
    { label: 'Sensors online', value: '86', delta: '+5.2%', accent: 'amber', icon: 'sensors' },
    { label: 'MQTT nodes', value: '19', delta: '96% healthy', accent: 'purple', icon: 'wifi_tethering' },
  ];

  infrastructures = [
    {
      id: 1,
      name: 'Madrid Smart Line',
      zone: 'Central hub',
      status: 'online',
      devices: [
        { name: 'Edge Gateway A01', type: 'Gateway', status: 'online', role: 'Broker' },
        { name: 'Energy Meter M21', type: 'Meter', status: 'online', role: 'Consumption' },
        { name: 'Access Panel X9', type: 'Controller', status: 'warning', role: 'Control' },
      ],
      sensors: [
        { name: 'Temperature Probe T12', type: 'Temperature', value: '23.8°C', status: 'online' },
        { name: 'Air Quality A04', type: 'Air quality', value: '82 AQI', status: 'warning' },
        { name: 'Humidity Node H19', type: 'Humidity', value: '41%', status: 'online' },
      ],
    },
    {
      id: 2,
      name: 'Barcelona Edge Cluster',
      zone: 'Coastal edge',
      status: 'warning',
      devices: [
        { name: 'Smart Sensor P08', type: 'Sensor', status: 'warning', role: 'Telemetry' },
        { name: 'Valve Controller C19', type: 'Controller', status: 'online', role: 'Actuation' },
        { name: 'Battery Bank B04', type: 'Power', status: 'offline', role: 'Backup' },
      ],
      sensors: [
        { name: 'Pressure Gauge P08', type: 'Pressure', value: '2.4 bar', status: 'warning' },
        { name: 'Flow Monitor F11', type: 'Flow', value: '1.4 m³/h', status: 'online' },
      ],
    },
  ];

  protocols: ProtocolItem[] = [
    { name: 'MQTT', detail: 'Telemetry and command channel for all edge nodes', status: 'enabled' },
    { name: 'MQTT TLS', detail: 'Encrypted transport between brokers and gateways', status: 'monitoring' },
    { name: 'QoS 1', detail: 'Reliable messages for sensor status and alerts', status: 'enabled' },
  ];

  getStatusClass(status: 'online' | 'warning' | 'offline'): string {
    return `status status-${status}`;
  }
}
