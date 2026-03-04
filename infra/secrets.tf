resource "random_password" "alloydb" {
  length  = 32
  special = false
}

resource "google_secret_manager_secret" "database_url" {
  secret_id = "${var.conference_name}-database-url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgres://nextlake:${random_password.alloydb.result}@${google_alloydb_instance.primary.ip_address}:5432/conference"
}
