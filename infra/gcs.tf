resource "google_storage_bucket" "assets" {
  name          = var.gcs_bucket_name
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 365
      with_state = "ARCHIVED"
    }
  }

  depends_on = [google_project_service.apis]
}
