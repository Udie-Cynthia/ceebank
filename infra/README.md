# CeeBank Infra Notes

## DNS (before TLS)
- Point **A** record for `ceebank.online` and `www.ceebank.online` to your Nginx host (EC2 public IP or ALB target).
- Open inbound **80** and **443** on the host/security group.

## Nginx + Certbot (on the host/container)
> Assumes the image built from `infra/nginx/Dockerfile` and `ceebank.conf` is running as the reverse proxy.

### 1) Check Nginx config and HTTP reachability
```bash
nginx -t
curl -I http://ceebank.online/
