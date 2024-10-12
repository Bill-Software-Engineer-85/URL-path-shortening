#!/bin/bash

echo "Authenticating Docker to Google Container Registry (GCR)..."
gcloud auth configure-docker

services=("url-shortener-backend" "url-shortener-frontend" "url-shortener-slug-service", "url-shortener-postgres")

for service in "${services[@]}"; do
  echo "Tagging and pushing ${service} image to GCR..."
  
  docker tag $service:latest gcr.io/url-shortener-project-438318/$service:latest
  docker push gcr.io/url-shortener-project-438318/$service:latest

  # Verify if the push was successful
  echo "Verifying if ${service} image was successfully pushed to GCR..."
  if docker pull gcr.io/url-shortener-project-438318/$service:latest; then
    echo "${service} image pushed successfully."
  else
    echo "Error: Failed to push ${service} image."
    exit 1
  fi
done

echo "All services pushed successfully!"
