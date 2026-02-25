variable "project_id" {
  description = "ID du projet GCP"
  type        = string
  default     = "collector-prod"
}

variable "region" {
  description = "Région GCP (ex: europe-west1)"
  type        = string
  default     = "europe-west1"
}

variable "cluster_name" {
  description = "Nom du cluster GKE"
  type        = string
  default     = "collector-cluster"
}

variable "environment" {
  description = "Nom de l'environnement (production, recette)"
  type        = string
  default     = "production"
}

variable "machine_type" {
  description = "Type de machine GCE pour les nœuds"
  type        = string
  default     = "e2-standard-2"
}

variable "min_node_count" {
  description = "Nombre minimum de nœuds (autoscaling)"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Nombre maximum de nœuds (autoscaling)"
  type        = number
  default     = 5
}
