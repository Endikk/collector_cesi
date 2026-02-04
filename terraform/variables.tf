variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP Region for deployment"
  type        = string
  default     = "europe-west1"
}

variable "app_name" {
  description = "The name of the application"
  type        = string
  default     = "collector-app"
}

variable "db_password" {
  description = "The password for the Cloud SQL database user"
  type        = string
  sensitive   = true
}

variable "container_image" {
  description = "The full path to the container image in Artifact Registry"
  type        = string
}
