# UFW Panel - Web UI for Uncomplicated Firewall

UFW Panel provides a user-friendly web interface to manage UFW (Uncomplicated Firewall) on your Linux server. It consists of a Go-based backend API and a Next.js frontend.

## ✨ Features

*   **Firewall Status:** View whether UFW is active or inactive.
*   **Toggle Firewall:** Easily enable or disable UFW.
*   **Rule Management:**
    *   View all current UFW rules with their numbers.
    *   Add new rules:
        *   Allow or deny traffic on specific ports.
        *   Allow or deny traffic from specific IP addresses (optionally for specific ports).
    *   Delete existing rules by their number.
*   **Secure Access:** Password-protected interface to prevent unauthorized changes.
*   **Responsive Design:** Manage your firewall from desktop or mobile devices.

## 😎 How to use

The installation process involves setting up the backend service and then deploying the frontend container.

### 1. Install Backend

The backend is a Go application that interacts with UFW and provides an API for the frontend.

```bash
# Download the deployment script
wget https://raw.githubusercontent.com/Gouryella/UFW-Panel/main/deploy_backend.sh

# Make the script executable
chmod +x deploy_backend.sh

# Run the script with sudo (it requires root privileges)
sudo ./deploy_backend.sh
```

During the execution, the script will:
*   Detect your server's architecture (amd64 or arm64).
*   Fetch the latest backend release from GitHub.
*   Prompt you to enter:
    *   **Port for the backend service:** (Default: `8080`) This is the port the backend API will listen on.
    *   **Password for API access:** This password will be used by the frontend to authenticate with the backend. Remember this password, as you'll need it for the frontend setup.
    *   **CORS allowed origin:** This should be the URL where your frontend will be accessible (e.g., `http://your_server_ip:30737` or `http://localhost:3000` if running locally).
*   Install the backend executable to `/usr/local/bin`.
*   Create an environment file at `/usr/local/bin/.env_ufw_backend` with your settings.
*   Set up a systemd service named `ufw-panel-backend` to manage the backend process.
*   Start and enable the service.

You can manage the backend service using standard systemd commands:
*   `sudo systemctl status ufw-panel-backend`
*   `sudo systemctl stop ufw-panel-backend`
*   `sudo systemctl start ufw-panel-backend`
*   `sudo systemctl restart ufw-panel-backend`
*   `sudo journalctl -u ufw-panel-backend -f` (to view logs)

### 2. Install Frontend

The frontend is a Next.js application deployed using Docker.

```bash
# Download the sample environment file
wget https://raw.githubusercontent.com/Gouryella/UFW-Panel/main/.env.sample

# Copy it to .env
cp .env.sample .env

# Download the Docker Compose file
wget https://raw.githubusercontent.com/Gouryella/UFW-Panel/main/docker-compose.yml
```

Next, **edit the `.env` file** with your specific configuration:

```env
JWT_SECRET="your_auth_secret"
AUTH_PASSWORD="your_auth_token"
JWT_EXPIRATION=1d
```

*   `JWT_SECRET`: Set this to a long, random, and strong secret string. This is used to sign authentication tokens for the web UI. You can generate one using `openssl rand -hex 32`.
*   `AUTH_PASSWORD`: **Important!** This **must** be the same password you set during the backend installation when prompted for "Password for API access". This password is used by the frontend to log in to the backend API.
*   `JWT_EXPIRATION`: Defines how long the login session for the web UI remains valid (e.g., `1d` for one day, `7d` for seven days).

After configuring the `.env` file, deploy the frontend using Docker Compose:

```bash
docker compose up -d
```

This command will:
*   Pull the latest `gouryella/ufw-panel:latest` Docker image for the frontend.
*   Start a container named `ufw-panel-frontend`.
*   Map port `30737` on your host to port `3000` inside the container.
*   Use the `.env` file for environment variables.
*   Mount a volume `ufw_db_data` for persistent data (if any is used by the frontend for its own settings, separate from UFW rules).
*   Set the container to restart automatically unless stopped.

### 3. Accessing the UFW Panel

Once both the backend and frontend are running, you can access the UFW Panel web interface in your browser.

Navigate to: `http://<your-server-ip>:30737`

Replace `<your-server-ip>` with the actual IP address of your server. You will be prompted to log in using the `AUTH_PASSWORD` you configured.

## 📄 License

This project is open-source. Please refer to the license file if one is included, or assume standard open-source licensing practices.
