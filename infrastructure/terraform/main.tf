# =============================================================================
# Collector.shop — Infrastructure GCP
#
# Provisionne :
#   - Un cluster GKE (Google Kubernetes Engine) privé
#   - Un node pool avec autoscaling et Workload Identity
#   - Le namespace Kubernetes "collector"
#
# Déploiement applicatif (manifests K8s) géré séparément via Kustomize / Skaffold.
# =============================================================================

# -----------------------------------------------------------------------------
# Cluster GKE
# -----------------------------------------------------------------------------
resource "google_container_cluster" "collector" {
  name     = var.cluster_name
  location = var.region

  # Supprime le node pool par défaut pour gérer le nôtre explicitement
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = "default"
  subnetwork = "default"

  # Workload Identity — accès sécurisé aux APIs GCP depuis les pods
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Network Policy (Calico) — isolation réseau entre pods
  network_policy {
    enabled  = true
    provider = "CALICO"
  }

  # Cluster privé — nœuds sans IP publique
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  ip_allocation_policy {}

  # Protection contre la suppression accidentelle en production
  deletion_protection = var.environment == "production"

  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}

# -----------------------------------------------------------------------------
# Node Pool
# -----------------------------------------------------------------------------
resource "google_container_node_pool" "collector_nodes" {
  name     = "${var.cluster_name}-node-pool"
  location = var.region
  cluster  = google_container_cluster.collector.name

  autoscaling {
    min_node_count = var.min_node_count
    max_node_count = var.max_node_count
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  node_config {
    machine_type = var.machine_type
    disk_size_gb = 50
    disk_type    = "pd-standard"

    # Scopes nécessaires pour Artifact Registry, Stackdriver, etc.
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]

    # Workload Identity sur les nœuds
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    labels = {
      environment = var.environment
      app         = "collector"
    }
  }
}

# -----------------------------------------------------------------------------
# Namespace Kubernetes — collector
# -----------------------------------------------------------------------------
resource "kubernetes_namespace" "collector" {
  metadata {
    name = "collector"

    labels = {
      environment = var.environment
      managed-by  = "terraform"
    }
  }

  depends_on = [google_container_node_pool.collector_nodes]
}
