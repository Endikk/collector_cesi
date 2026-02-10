

output "namespace" {
  value = kubernetes_namespace.collector.metadata[0].name
}
