output "frontend_service_name" {
  value = kubernetes_service.frontend.metadata[0].name
}

output "namespace" {
  value = kubernetes_namespace.collector.metadata[0].name
}
