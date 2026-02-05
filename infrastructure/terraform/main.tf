resource "kubernetes_namespace" "collector" {
  metadata {
    name = "collector"
  }
}

resource "kubernetes_secret" "db_secrets" {
  metadata {
    name      = "db-secrets"
    namespace = kubernetes_namespace.collector.metadata[0].name
  }

  data = {
    database_url = "postgresql://user:password@postgres-service:5432/collector?schema=public"
  }
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "collector-db"
    namespace = kubernetes_namespace.collector.metadata[0].name
    labels = {
      app = "db"
    }
  }

  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "db"
      }
    }
    template {
      metadata {
        labels = {
          app = "db"
        }
      }
      spec {
        container {
          image = "postgres:15-alpine"
          name  = "postgres"
          env {
            name  = "POSTGRES_USER"
            value = "user"
          }
          env {
            name  = "POSTGRES_PASSWORD"
            value = "password"
          }
          env {
            name  = "POSTGRES_DB"
            value = "collector"
          }
          port {
            container_port = 5432
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = "postgres-service"
    namespace = kubernetes_namespace.collector.metadata[0].name
  }
  spec {
    selector = {
      app = kubernetes_deployment.postgres.metadata[0].labels.app
    }
    port {
      port        = 5432
      target_port = 5432
    }
  }
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "collector-backend"
    namespace = kubernetes_namespace.collector.metadata[0].name
    labels = {
      app = "backend"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        container {
          image             = "collector-backend:latest"
          name              = "backend"
          image_pull_policy = "Never"

          port {
            container_port = 3000
          }

          env {
            name = "DATABASE_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.db_secrets.metadata[0].name
                key  = "database_url"
              }
            }
          }
          
          env {
             name = "PORT"
             value = "3000"
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend-service"
    namespace = kubernetes_namespace.collector.metadata[0].name
  }
  spec {
    selector = {
      app = kubernetes_deployment.backend.metadata[0].labels.app
    }
    port {
      port        = 3000
      target_port = 3000
    }
    type = "ClusterIP"
  }
}

resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "collector-frontend"
    namespace = kubernetes_namespace.collector.metadata[0].name
    labels = {
      app = "frontend"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }

      spec {
        container {
          image             = "collector-app:latest"
          name              = "frontend"
          image_pull_policy = "Never"

          port {
            container_port = 3000
          }

          env {
            name = "DATABASE_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.db_secrets.metadata[0].name
                key  = "database_url"
              }
            }
          }
          
           env {
            name = "NEXTAUTH_URL"
            value = "http://localhost:3000" 
          }
          
          env {
             name = "NEXTAUTH_SECRET"
             value = "supersecret" # Should be in secret in prod
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend-service"
    namespace = kubernetes_namespace.collector.metadata[0].name
  }
  spec {
    selector = {
      app = kubernetes_deployment.frontend.metadata[0].labels.app
    }
    port {
      port        = 3000
      target_port = 3000
    }
    type = "NodePort" # Changed to NodePort for easy Minikube access
  }
}
