resource "google_compute_network" "main" {
  name                    = "${var.conference_name}-network"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.apis]
}

resource "google_compute_subnetwork" "main" {
  name          = "${var.conference_name}-subnet"
  ip_cidr_range = "10.0.0.0/24"
  network       = google_compute_network.main.id
  region        = var.region
}

resource "google_compute_global_address" "psa" {
  name          = "${var.conference_name}-psa"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id
}

resource "google_service_networking_connection" "psa" {
  network                 = google_compute_network.main.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.psa.name]
}

resource "google_alloydb_cluster" "main" {
  cluster_id = "${var.conference_name}-db"
  location   = var.region
  network_config {
    network = google_compute_network.main.id
  }
  initial_user {
    user     = "nextlake"
    password = random_password.alloydb.result
  }
  depends_on = [google_service_networking_connection.psa]
}

resource "google_alloydb_instance" "primary" {
  cluster       = google_alloydb_cluster.main.name
  instance_id   = "${var.conference_name}-primary"
  instance_type = "PRIMARY"
  machine_config {
    cpu_count = 2
  }
}

resource "google_vpc_access_connector" "main" {
  name          = "${var.conference_name}-vpc"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.main.name
  depends_on    = [google_project_service.apis]
}
