resource "google_cloud_run_v2_service" "app" {
  name     = var.conference_name
  location = var.region

  template {
    service_account = google_service_account.cloudrun.email

    vpc_access {
      connector = google_vpc_access_connector.main.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = var.docker_image

      ports {
        container_port = 3000
      }

      env {
        name  = "DATABASE_URL"
        value = "postgres://nextlake:${var.alloydb_password}@${google_alloydb_instance.primary.ip_address}:5432/conference"
      }
      env {
        name  = "GCS_BUCKET"
        value = google_storage_bucket.assets.name
      }
      env {
        name  = "GCS_PREFIX"
        value = "assets/"
      }
      env {
        name  = "GOOGLE_CLIENT_ID"
        value = var.google_client_id
      }
      env {
        name  = "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
        value = var.google_client_id
      }
      env {
        name  = "SEED_ADMIN_ID"
        value = var.seed_admin_id
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      startup_probe {
        http_get {
          path = "/"
        }
        initial_delay_seconds = 5
        period_seconds        = 10
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.app.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
