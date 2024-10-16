provider "google" {
  credentials = file("gcp-key.json")
  project     = var.project_id
  region      = "us-central1"
  zone        = "us-central1-a"
}

# Deploy the Backend to Cloud Run
resource "google_cloud_run_service" "backend_service" {
  name     = "backend-service"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/url-shortener/url-shortener-backend:latest"
        ports {
          container_port = 8080
        }
        resources {
          limits = {
            memory = "256Mi"
            cpu    = "1"
          }
        }
        env {
          name  = "POSTGRES_USER"
          value = google_sql_user.postgres_user.name
        }
        env {
          name  = "POSTGRES_PASSWORD"
          value = google_sql_user.postgres_user.password
        }
        env {
          name  = "POSTGRES_DB"
          value = google_sql_database.shortener_db.name
        }
        env {
          name  = "POSTGRES_HOST"
          value = google_sql_database_instance.postgres-instance.public_ip_address
        }
        env {
          name = "SLUG_SERVICE_URL"
          value = google_cloud_run_service.slug_service.status[0].url
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

# Allow unauthenticated access to the Backend Cloud Run Service
resource "google_cloud_run_service_iam_member" "backend_service_noauth" {
  service     = google_cloud_run_service.backend_service.name
  location    = google_cloud_run_service.backend_service.location
  role        = "roles/run.invoker"
  member      = "allUsers"
  depends_on = [google_cloud_run_service.backend_service]
  lifecycle {
    replace_triggered_by = [
      google_cloud_run_service.backend_service
    ]
  }
}

# Deploy the Slug-Service to Cloud Run
resource "google_cloud_run_service" "slug_service" {
  name     = "slug-service"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/url-shortener/url-shortener-slug-service:latest"
        ports {
          container_port = 8081
        }
        resources {
          limits = {
            memory = "256Mi"
            cpu    = "1"
          }
        }
        env {
          name  = "POSTGRES_USER"
          value = google_sql_user.postgres_user.name
        }
        env {
          name  = "POSTGRES_PASSWORD"
          value = google_sql_user.postgres_user.password
        }
        env {
          name  = "POSTGRES_DB"
          value = google_sql_database.shortener_db.name
        }
        env {
          name  = "POSTGRES_HOST"
          value = google_sql_database_instance.postgres-instance.public_ip_address
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

# Allow unauthenticated access to the Slug-Service Cloud Run Service
resource "google_cloud_run_service_iam_member" "slug_service_noauth" {
  service     = google_cloud_run_service.slug_service.name
  location    = google_cloud_run_service.slug_service.location
  role        = "roles/run.invoker"
  member      = "allUsers"
  depends_on = [google_cloud_run_service.slug_service]
  lifecycle {
    replace_triggered_by = [
      google_cloud_run_service.slug_service
    ]
  }
}

# Deploy the Frontend Service to Cloud Run
resource "google_cloud_run_service" "frontend_instance" {

  name     = "frontend-instance"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/url-shortener/url-shortener-frontend:latest"
        ports {
          container_port = 3000
        }
        resources {
          limits = {
            memory = "256Mi"
            cpu    = "1"
          }
        }
        env {
          name  = "BACKEND_URL"
          value = google_cloud_run_service.backend_service.status[0].url
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

# Allow unauthenticated access to the Cloud Run Service
resource "google_cloud_run_service_iam_member" "frontend_noauth" {
  service     = google_cloud_run_service.frontend_instance.name
  location    = google_cloud_run_service.frontend_instance.location
  role        = "roles/run.invoker"
  member      = "allUsers"
  depends_on = [google_cloud_run_service.frontend_instance]
  lifecycle {
    replace_triggered_by = [
      google_cloud_run_service.frontend_instance
    ]
  }
}

# Create a Cloud SQL instance for PostgreSQL
resource "google_sql_database_instance" "postgres-instance" {
  name             = "postgres-instance"
  database_version = "POSTGRES_13"
  region           = "us-central1"

  settings {
    tier = "db-f1-micro" # Smallest instance type for cost efficiency
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        value = "0.0.0.0/0" # Open to all, can be restricted for security purposes
      }
    }
  }
}

# Create a Cloud SQL database within the instance
resource "google_sql_database" "shortener_db" {
  name     = "urlshortener"
  instance = google_sql_database_instance.postgres-instance.name
}

# Create a Cloud SQL user
resource "google_sql_user" "postgres_user" {
  name     = "user"
  instance = google_sql_database_instance.postgres-instance.name
  password = "password"
}