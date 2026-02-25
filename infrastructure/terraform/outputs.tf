output "cluster_name" {
  description = "Nom du cluster GKE"
  value       = google_container_cluster.collector.name
}

output "cluster_endpoint" {
  description = "Endpoint HTTPS du cluster GKE"
  value       = google_container_cluster.collector.endpoint
  sensitive   = true
}

output "cluster_region" {
  description = "Région du cluster GKE"
  value       = google_container_cluster.collector.location
}

output "namespace" {
  description = "Namespace Kubernetes provisionné"
  value       = kubernetes_namespace.collector.metadata[0].name
}

output "kubeconfig_command" {
  description = "Commande pour configurer kubectl"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.collector.name} --region ${var.region} --project ${var.project_id}"
}
