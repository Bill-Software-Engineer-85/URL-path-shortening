#!/bin/bash

echo "Authenticating Docker to Google Artifact Registry..."
gcloud auth configure-docker us-central1-docker.pkg.dev

services=("url-shortener-backend" "url-shortener-frontend" "url-shortener-slug-service")

for service in "${services[@]}"; do
  echo "Tagging and pushing ${service} image to GCR..."
  
  # Tag the image for Artifact Registry
  docker tag $service:latest us-central1-docker.pkg.dev/url-shortener-project-438318/url-shortener/$service:latest

  # Push the image to Artifact Registry
  docker push us-central1-docker.pkg.dev/url-shortener-project-438318/url-shortener/$service:latest

  # Verify if the push was successful
  echo "Verifying if ${service} image was successfully pushed to GCR..."
  if docker pull us-central1-docker.pkg.dev/url-shortener-project-438318/url-shortener/$service:latest; then
    echo "${service} image pushed successfully."
  else
    echo "Error: Failed to push ${service} image."
    read -p "Press Enter to close the window..." 
  fi
done

echo "All services pushed successfully!"
read -p "Press Enter to close the window..." 
