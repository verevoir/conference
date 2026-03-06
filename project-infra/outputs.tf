output "workload_identity_provider" {
  description = "Workload Identity Provider resource name — use as workload_identity_provider in GitHub Actions"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "ci_service_account" {
  description = "CI service account email — use as service_account in GitHub Actions"
  value       = google_service_account.ci.email
}

output "artifact_registry_repo" {
  description = "Artifact Registry repository path"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${data.google_artifact_registry_repository.app.repository_id}"
}
