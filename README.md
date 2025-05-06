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

## 💻 Project Structure

```
.
├── backend/         # Go backend API
│   ├── main.go      # Main application
│   ├── ufw.go       # UFW command interaction logic
│   ├── go.mod
│   └── ...
├── frontend/        # Next.js web interface
│   ├── app/         # Next.js app router
│   ├── components/  # React components
│   ├── lib/         # Helper functions and type definitions
│   ├── public/
│   ├── package.json
│   └── ...
├── docker-compose.yml # Docker Compose for easy deployment
├── deploy_backend.sh  # Legacy backend deployment script (Linux)
├── .env.sample        # Sample environment variables for the project
└── README.md          # This file
```

## 🚀 Deployment

There are two primary ways to deploy UFW Panel: using Docker Compose (recommended for ease) or deploying the backend and frontend separately.

### Option 1: Docker Compose (Recommended)

This is the easiest way to get UFW Panel up and running.

1.  **Prerequisites:**
    *   Docker and Docker Compose installed on your Linux server.
    *   UFW installed on the host machine (`sudo apt update && sudo apt install ufw`).
    *   The user running Docker (or the user inside the backend container if modified) needs passwordless `sudo` privileges for the `ufw` command.
        *   Edit the sudoers file: `sudo visudo`
        *   Add: `your_docker_user ALL=(ALL) NOPASSWD: /usr/sbin/ufw` (Replace `your_docker_user` if necessary. Often, this might be `root` if the container runs as root, or the user specified in the Dockerfile/compose file). **Warning:** Be careful editing sudoers.

2.  **Configuration:**
    *   Copy `.env.sample` to `.env`:
        ```bash
        cp .env.sample .env
        ```
    *   Edit the `.env` file and set the following variables:
        *   `UFW_API_KEY`: A strong, unique secret key for backend API authentication.
        *   `BACKEND_PORT`: The port the backend will listen on (default: `8080`).
        *   `FRONTEND_PORT`: The port the frontend will be accessible on (default: `3000`).
        *   `AUTH_SECRET`: A strong random string for session encryption (at least 32 characters).
        *   `NEXT_PUBLIC_API_BASE_URL`: This will be automatically set up by Docker Compose if you use the default service names. If you change service names or run outside Docker Compose, it should be `http://<backend_host>:<backend_port>`.

3.  **Build and Run:**
    ```bash
    docker-compose up -d --build
    ```
    This will build the images and start the backend and frontend services in detached mode.

4.  **Access:**
    Open your browser and navigate to `http://<your-server-ip>:<FRONTEND_PORT>` (e.g., `http://localhost:3000`). You will be prompted for the `UFW_API_KEY` you set in the `.env` file as the password.

5.  **Managing Services:**
    *   Stop: `docker-compose down`
    *   View logs: `docker-compose logs -f backend` or `docker-compose logs -f frontend`

### Option 2: Manual Deployment

#### Backend (Go API)

1.  **Prerequisites:**
    *   Go (version 1.18+).
    *   UFW installed (`sudo apt update && sudo apt install ufw`).
    *   Passwordless `sudo` for `ufw` command for the user running the backend.
        *   `sudo visudo`
        *   Add: `your_backend_user ALL=(ALL) NOPASSWD: /usr/sbin/ufw`

2.  **Setup:**
    *   Navigate to the `backend` directory: `cd backend`
    *   Create a `.env` file (or copy from `backend/.env.sample` if it exists, or use the root `.env.sample` as a guide):
        ```dotenv
        UFW_API_KEY="your-strong-secret-key-here" # Replace with your secret key
        PORT=8080                               # Port for the backend to listen on
        ```
    *   Install dependencies: `go mod tidy`

3.  **Run:**
    ```bash
    go run main.go
    ```
    For production, consider building a binary (`go build .`) and running it with a process manager like `systemd`. The `deploy_backend.sh` script provides an example of setting up a systemd service.

#### Frontend (Next.js)

1.  **Prerequisites:**
    *   Node.js (LTS version recommended) and npm/yarn.

2.  **Setup:**
    *   Navigate to the `frontend` directory: `cd frontend`
    *   Install dependencies: `npm install` (or `yarn install`)
    *   Create a `.env.local` file:
        ```dotenv
        NEXT_PUBLIC_API_BASE_URL=http://<your-backend-server-ip>:<backend-port> # e.g., http://localhost:8080
        AUTH_SECRET=your_strong_random_secret_string_here_for_nextauth # Must be a strong random string
        ```

3.  **Build and Run:**
    *   Build: `npm run build`
    *   Start: `npm start`
    This will start the Next.js production server. You can deploy this using Vercel, Netlify, or self-host with a process manager like PM2.

## 🛠️ Usage

Once deployed, access the UFW Panel through your web browser at the frontend URL.
You will be prompted to enter the password (which is the `UFW_API_KEY` set for the backend) to log in.

After logging in, you can:
*   View the current UFW status and rules.
*   Enable or disable UFW.
*   Add new rules by specifying port, protocol (TCP/UDP), action (allow/deny), and optional source/destination IP.
*   Delete rules by clicking the delete icon next to them.

## 💻 Development

### Backend

1.  Go to the `backend` directory.
2.  Ensure Go is installed.
3.  Set up the `.env` file as described in the manual backend deployment.
4.  Ensure UFW is installed and sudoers are configured.
5.  Run `go mod tidy` to install dependencies.
6.  Run `go run main.go` to start the development server.

### Frontend

1.  Go to the `frontend` directory.
2.  Ensure Node.js and npm/yarn are installed.
3.  Run `npm install` or `yarn install` to install dependencies.
4.  Create a `.env.local` file as described in the manual frontend deployment, pointing `NEXT_PUBLIC_API_BASE_URL` to your running backend (e.g., `http://localhost:8080` if the backend is running locally on port 8080).
5.  Run `npm run dev` or `yarn dev` to start the Next.js development server (usually on `http://localhost:3000`).

## 🔑 API Key (Password)

The web interface uses the `UFW_API_KEY` (defined in the backend's `.env` file) as the password for authentication. Ensure this is kept secret and is sufficiently complex.

## 📄 License

This project is open-source. Please refer to the license file if one is included, or assume standard open-source licensing practices.
