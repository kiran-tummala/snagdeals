Hetzner provisioning
--------------------

This directory contains a Terraform template (`terraform-hetzner.tf`) and a `cloud-init.yaml` example for provisioning a Hetzner CX11 server and bootstrapping it to run the `setup.sh` script.

Quick Terraform steps:

1. Install Terraform: https://developer.hashicorp.com/terraform/tutorials
2. Create `terraform.tfvars` with:

```
hcloud_token = "YOUR_HETZNER_API_TOKEN"
ssh_key = "$(cat ~/.ssh/id_rsa.pub)"
```

3. Initialize and apply:

```bash
terraform init
terraform apply -auto-approve
```

4. Terraform outputs the server IP in `ipv4`.

API (curl) alternative:

Replace `YOUR_HETZNER_TOKEN` and `SERVER_NAME` and provide `user_data` or use the `cloud-init.yaml` contents.

```bash
curl -X POST "https://api.hetzner.cloud/v1/servers" \
  -H "Authorization: Bearer YOUR_HETZNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"snagdeals-1",
    "server_type":"cx11",
    "image":"ubuntu-22.04",
    "location":"nbg1",
    "ssh_keys":["your-ssh-fingerprint-or-id"],
    "user_data":"<BASE64_ENCODED_CLOUD_INIT>"
  }'
```

Notes:
- Replace `YOUR_DOMAIN_HERE` in `cloud-init.yaml` before using cloud-init, or run `setup.sh` manually after provisioning.
- Cloud-init will clone the repo and attempt to run `setup.sh` (interactive certbot step may require manual input).
