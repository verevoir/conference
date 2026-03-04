resource "google_compute_global_address" "lb" {
  name       = "${var.conference_name}-lb-ip"
  depends_on = [google_project_service.apis]
}

resource "google_compute_managed_ssl_certificate" "app" {
  name = "${var.conference_name}-cert"
  managed {
    domains = [var.domain]
  }
  depends_on = [google_project_service.apis]
}

resource "google_compute_region_network_endpoint_group" "cloudrun" {
  name                  = "${var.conference_name}-neg"
  region                = var.region
  network_endpoint_type = "SERVERLESS"
  cloud_run {
    service = google_cloud_run_v2_service.app.name
  }
}

resource "google_compute_backend_service" "app" {
  name                  = "${var.conference_name}-backend"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.cloudrun.id
  }
}

resource "google_compute_url_map" "app" {
  name            = "${var.conference_name}-urlmap"
  default_service = google_compute_backend_service.app.id
}

resource "google_compute_url_map" "https_redirect" {
  name = "${var.conference_name}-https-redirect"
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
  depends_on = [google_project_service.apis]
}

resource "google_compute_target_https_proxy" "app" {
  name             = "${var.conference_name}-https-proxy"
  url_map          = google_compute_url_map.app.id
  ssl_certificates = [google_compute_managed_ssl_certificate.app.id]
}

resource "google_compute_target_http_proxy" "redirect" {
  name    = "${var.conference_name}-http-redirect"
  url_map = google_compute_url_map.https_redirect.id
}

resource "google_compute_global_forwarding_rule" "https" {
  name                  = "${var.conference_name}-https"
  ip_address            = google_compute_global_address.lb.address
  port_range            = "443"
  target                = google_compute_target_https_proxy.app.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

resource "google_compute_global_forwarding_rule" "http_redirect" {
  name                  = "${var.conference_name}-http-redirect"
  ip_address            = google_compute_global_address.lb.address
  port_range            = "80"
  target                = google_compute_target_http_proxy.redirect.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
