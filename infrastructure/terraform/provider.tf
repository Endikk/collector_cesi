terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  # Décommente pour activer le state distant (production)
  # backend "gcs" {
  #   bucket = "collector-terraform-state"
  #   prefix = "terraform/state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Données du client GCP authentifié (Application Default Credentials)
data "google_client_config" "default" {}

provider "kubernetes" {
  host                   = "https://${google_container_cluster.collector.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(
    google_container_cluster.collector.master_auth[0].cluster_ca_certificate
  )
}
