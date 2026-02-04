# -----------------------------------------------------------------------------
# 1. Enable Required APIs
# -----------------------------------------------------------------------------
resource "google_project_service" "run_api" {
  service = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "sql_api" {
  service = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry_api" {
  service = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# -----------------------------------------------------------------------------
# 2. Networking (VPC for Secure DB Access)
# -----------------------------------------------------------------------------
resource "google_compute_network" "vpc_network" {
  name = "${var.app_name}-vpc"
}

resource "google_vpc_access_connector" "connector" {
  name          = "${var.app_name}-vpc-con"
  region        = var.region
  network       = google_compute_network.vpc_network.name
  ip_cidr_range = "10.8.0.0/28"
}

# -----------------------------------------------------------------------------
# 3. Database (Cloud SQL - PostgreSQL)
# -----------------------------------------------------------------------------
resource "google_sql_database_instance" "postgres" {
  name             = "${var.app_name}-db-instance"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier = "db-f1-micro" # Cost-effective for dev/school
    ip_configuration {
        ipv4_enabled    = true # Public IP for simulation simplicity (use private in real prod)
    }
  }
  
  deletion_protection = false # Allows 'terraform destroy' to work easily
  depends_on          = [google_project_service.sql_api]
}

resource "google_sql_database" "database" {
  name     = "collector"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "users" {
  name     = "collector-user"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# -----------------------------------------------------------------------------
# 4. Artifact Registry (Repository for Docker Images)
# -----------------------------------------------------------------------------
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "${var.app_name}-repo"
  format        = "DOCKER"
  depends_on    = [google_project_service.artifact_registry_api]
}

# -----------------------------------------------------------------------------
# 5. Compute (Cloud Run - Serverless Container)
# -----------------------------------------------------------------------------
resource "google_cloud_run_v2_service" "default" {
  name     = "${var.app_name}-service"
  location = var.region
  ingress = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = var.container_image
      
      env {
        name  = "DATABASE_URL"
        # Connection string for Prisma
        value = "postgresql://collector-user:${var.db_password}@${google_sql_database_instance.postgres.public_ip_address}:5432/collector"
      }
      
      env {
        name  = "NEXTAUTH_URL"
        # In real scenario, refer to the service URL itself or domain
        value = "placeholder-url-replaced-after-deploy"
      }
      
      ports {
        container_port = 3000
      }
    }
    
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }

  depends_on = [google_project_service.run_api]
}

# -----------------------------------------------------------------------------
# 6. IAM (Allow Public Access)
# -----------------------------------------------------------------------------
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.default.location
  service  = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
