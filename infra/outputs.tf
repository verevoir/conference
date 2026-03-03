output "cloud_run_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.app.uri
}

output "gcs_bucket" {
  description = "GCS bucket name for assets"
  value       = google_storage_bucket.assets.name
}

output "alloydb_ip" {
  description = "AlloyDB primary instance IP"
  value       = google_alloydb_instance.primary.ip_address
}

output "service_account" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloudrun.email
}
