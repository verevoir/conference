resource "google_service_account" "cloudrun" {
  account_id   = "${var.conference_name}-run"
  display_name = "Cloud Run service account for ${var.conference_name}"
}

resource "google_storage_bucket_iam_member" "cloudrun_storage" {
  bucket = google_storage_bucket.assets.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.cloudrun.email}"
}

resource "google_project_iam_member" "cloudrun_alloydb" {
  project = var.project_id
  role    = "roles/alloydb.client"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}
