#!/bin/bash

# Load the project ID from terraform.tfvars
PROJECT_ID=$(grep 'project_id' terraform.tfvars | awk -F ' *= *' '{print $2}' | tr -d '"')

if [ -z "$PROJECT_ID" ]; then
  echo "Project ID not found in terraform.tfvars"
  read -p "Press Enter to close the window..." 
fi

echo "Authenticating Docker to Google Artifact Registry..."
gcloud auth configure-docker us-central1-docker.pkg.dev

services=("url-shortener-backend" "url-shortener-frontend" "url-shortener-slug-service")

for service in "${services[@]}"; do
  echo "Tagging and pushing ${service} image to Artifact Registry..."

  # Tag the image for Artifact Registry
  docker tag $service:latest us-central1-docker.pkg.dev/${PROJECT_ID}/url-shortener/$service:latest

  # Push the image to Artifact Registry
  docker push us-central1-docker.pkg.dev/${PROJECT_ID}/url-shortener/$service:latest
done

echo "All services pushed successfully!"
read -p "Press Enter to close the window..." 