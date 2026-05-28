# Shelcorp Website

This repository is the source of truth for the static website served from the Shelcorp VPS.

Production host: `server1.shelcorp.com` / `shelcorp.com`

Production checkout on the VPS:

```text
/opt/shelcorp/shel-web
```

Nginx serves this checkout directly as the document root. To deploy changes on the VPS:

```bash
cd /opt/shelcorp/shel-web
./deploy.sh
```
