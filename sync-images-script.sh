#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="izac-frontend:1.0.0"
IMAGE_TAR="izac-frontend_1.0.0_arm64.tar"
SSH_USER="igor"
WORKERS=(192.168.0.51 192.168.0.52 192.168.0.53 192.168.0.54)

echo "Building ${IMAGE_TAG} for ARM64..."
docker buildx build --platform linux/arm64 -t "${IMAGE_TAG}" --load .

echo "Saving image tar ${IMAGE_TAR}..."
docker save "${IMAGE_TAG}" -o "${IMAGE_TAR}"

for host in "${WORKERS[@]}"; do
  echo "Copying image tar to ${host}..."
  scp "${IMAGE_TAR}" "${SSH_USER}@${host}:~/"

  echo "Importing image on ${host}..."
  ssh "${SSH_USER}@${host}" "sudo k3s ctr images import ~/${IMAGE_TAR} && sudo k3s ctr images ls | grep izac-frontend"
done

echo "Done. Image imported on all worker nodes."