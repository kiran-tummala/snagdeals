terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.37"
    }
  }
}

provider "hcloud" {
  token = var.hcloud_token
}

variable "hcloud_token" {}
variable "ssh_key" {}

resource "hcloud_ssh_key" "default" {
  name       = "snagdeals-key"
  public_key = var.ssh_key
}

resource "hcloud_server" "snagdeals" {
  name        = "snagdeals-1"
  image       = "ubuntu-22.04"
  server_type = "cx11"
  location    = "nbg1"
  ssh_keys    = [hcloud_ssh_key.default.id]
  user_data   = file("cloud-init.yaml")
}

output "ipv4" {
  value = hcloud_server.snagdeals.ipv4_address
}
