resource "kubernetes_namespace" "collector" {
  metadata {
    name = "collector"
  }
}



# NOTE: This file focuses on Infrastructure provisioning (e.g., Namespaces, StorageClasses, CRDs).
# Application deployment (Software) is managed via Kubernetes manifests (Kustomize/Helm) in ../k8s/
# In a real-world scenario, this file would also provision the Kubernetes Cluster itself (EKS, GKE, AKS).
