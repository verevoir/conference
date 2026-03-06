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

variable "github_owner" {
  description = "GitHub organisation or user that owns the repo"
  type        = string
}

variable "github_repo" {
  description = "Full GitHub repo path (owner/repo)"
  type        = string
}
