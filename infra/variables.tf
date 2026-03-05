variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "europe-west2"
}

variable "conference_name" {
  description = "Name used for resource naming"
  type        = string
  default     = "verevoir-conference"
}

variable "gcs_bucket_name" {
  description = "GCS bucket for asset storage"
  type        = string
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
}

variable "seed_admin_id" {
  description = "Google sub ID for seed admin user"
  type        = string
}

variable "docker_image" {
  description = "Container image URL for Cloud Run"
  type        = string
}

variable "domain" {
  description = "Custom domain for the conference app"
  type        = string
}
