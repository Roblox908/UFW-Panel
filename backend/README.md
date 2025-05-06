# UFW Control Backend API

This project provides a simple Go backend server using the Gin framework to control the UFW (Uncomplicated Firewall) via a REST API. Access to the API is protected by an API key.

## Prerequisites

1.  **Go:** Ensure you have Go installed (version 1.18 or later recommended).
2.  **UFW:** The server running this backend must have UFW installed (`sudo apt update && sudo apt install ufw`).
3.  **Sudo Permissions:** The user running this Go application needs passwordless `sudo` privileges specifically for the `ufw` command.

## Setup

1.  **Clone the Repository (if applicable):**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Create `.env` File:**
    Create a file named `.env` in the project root directory with the following content:
    ```dotenv
    # UFW Backend Configuration
    UFW_API_KEY="your-strong-secret-key-here"
    PORT=8080
    ```
    -   **IMPORTANT:** Replace `"your-strong-secret-key-here"` with a strong, unique secret key. This key will be required for all API requests.
    -   You can change the `PORT` if needed.

3.  **Configure Sudoers:**
    You **must** grant the user running this application passwordless sudo access for the `ufw` command.
    -   Edit the sudoers file using `sudo visudo`.
    -   Add the following line at the end, replacing `your_username` with the actual username that will run the Go application:
        ```
        your_username ALL=(ALL) NOPASSWD: /usr/sbin/ufw
        ```
    -   **Warning:** Be extremely careful when editing the sudoers file. Incorrect syntax can lock you out of sudo access.

4.  **Install Dependencies:**
    ```bash
    go mod tidy
    ```

## Running the Server

```bash
go run .
```
The server will start and listen on the port specified in the `.env` file (default: 8080). You should see output indicating the server is running.

## API Usage

All API endpoints require the `X-API-KEY` header containing the secret key defined in your `.env` file.

**Base URL:** `http://localhost:PORT` (replace `PORT` with the value from `.env`)

---

### 1. Get UFW Status

-   **Method:** `GET`
-   **Path:** `/status`
-   **Headers:**
    -   `X-API-KEY: <your-api-key>`
-   **Description:** Retrieves the current UFW status (active/inactive) and the list of numbered rules.
-   **Example (`curl`):**
    ```bash
    curl -H "X-API-KEY: your-strong-secret-key-here" http://localhost:8080/status
    ```
-   **Success Response (Example):**
    ```json
    {
        "status": "active",
        "rules": [
            "[ 1] 22/tcp                     ALLOW IN    Anywhere",
            "[ 2] 80/tcp                     ALLOW IN    Anywhere",
            "[ 3] 443/tcp                    ALLOW IN    Anywhere",
            "[ 4] 8080/tcp                   ALLOW IN    Anywhere"
        ]
    }
    ```
-   **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`

---

### 2. Add Allow Rule

-   **Method:** `POST`
-   **Path:** `/rules/allow`
-   **Headers:**
    -   `X-API-KEY: <your-api-key>`
    -   `Content-Type: application/json`
-   **Request Body (JSON):**
    ```json
    {
        "rule": "<ufw-rule-specification>"
    }
    ```
    (e.g., `"80/tcp"`, `"allow 22"`, `"allow from 192.168.1.100"`)
-   **Description:** Adds a new 'allow' rule to UFW.
-   **Example (`curl`):**
    ```bash
    curl -X POST -H "X-API-KEY: your-strong-secret-key-here" -H "Content-Type: application/json" \
    -d '{"rule": "8080/tcp"}' http://localhost:8080/rules/allow
    ```
-   **Success Response:**
    ```json
    {
        "message": "Rule added successfully",
        "rule": "8080/tcp"
    }
    ```
-   **Error Responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`

---

### 3. Add Deny Rule

-   **Method:** `POST`
-   **Path:** `/rules/deny`
-   **Headers:**
    -   `X-API-KEY: <your-api-key>`
    -   `Content-Type: application/json`
-   **Request Body (JSON):**
    ```json
    {
        "rule": "<ufw-rule-specification>"
    }
    ```
    (e.g., `"22"`, `"deny from 10.0.0.5"`)
-   **Description:** Adds a new 'deny' rule to UFW.
-   **Example (`curl`):**
    ```bash
    curl -X POST -H "X-API-KEY: your-strong-secret-key-here" -H "Content-Type: application/json" \
    -d '{"rule": "22"}' http://localhost:8080/rules/deny
    ```
-   **Success Response:**
    ```json
    {
        "message": "Deny rule added successfully",
        "rule": "22"
    }
    ```
-   **Error Responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`

---

### 4. Delete Rule by Number

-   **Method:** `DELETE`
-   **Path:** `/rules/delete/:number` (replace `:number` with the rule number from `/status`)
-   **Headers:**
    -   `X-API-KEY: <your-api-key>`
-   **Description:** Deletes a UFW rule using its number (obtained from `ufw status numbered` or the `/status` endpoint). Requires confirmation internally (handled by the backend).
-   **Example (`curl`):**
    ```bash
    # Assuming rule [ 3] is the one to delete
    curl -X DELETE -H "X-API-KEY: your-strong-secret-key-here" http://localhost:8080/rules/delete/3
    ```
-   **Success Response:**
    ```json
    {
        "message": "Rule deleted successfully",
        "rule_number": "3"
    }
    ```
-   **Error Responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` (if rule number doesn't exist), `500 Internal Server Error`

---

### 5. Enable UFW

-   **Method:** `POST`
-   **Path:** `/enable`
-   **Headers:**
    -   `X-API-KEY: <your-api-key>`
-   **Description:** Enables the UFW firewall. Requires confirmation internally if rules exist (handled by the backend).
-   **Example (`curl`):**
    ```bash
    curl -X POST -H "X-API-KEY: your-strong-secret-key-here" http://localhost:8080/enable
    ```
-   **Success Response:**
    ```json
    {
        "message": "UFW enabled successfully (or was already active)"
    }
    ```
-   **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`

---

### 6. Disable UFW

-   **Method:** `POST`
-   **Path:** `/disable`
-   **Headers:**
    -   `X-API-KEY: <your-api-key>`
-   **Description:** Disables the UFW firewall.
-   **Example (`curl`):**
    ```bash
    curl -X POST -H "X-API-KEY: your-strong-secret-key-here" http://localhost:8080/disable
    ```
-   **Success Response:**
    ```json
    {
        "message": "UFW disabled successfully (or was already inactive)"
    }
    ```
-   **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`

---

### 7. Ping (Authenticated)

-   **Method:** `GET`
-   **Path:** `/ping`
-   **Headers:**
    -   `X-API-KEY: <your-api-key>`
-   **Description:** A simple authenticated endpoint to check if the API is reachable and the API key is valid.
-   **Example (`curl`):**
    ```bash
    curl -H "X-API-KEY: your-strong-secret-key-here" http://localhost:8080/ping
    ```
-   **Success Response:**
    ```json
    {
        "message": "pong"
    }
    ```
-   **Error Responses:** `401 Unauthorized`, `403 Forbidden`

---

### 8. Add Allow Rule From IP

-   **Method:** `POST`
-   **Path:** `/rules/allow/ip`
-   **Headers:**
    -   `X-API-KEY: <your-api-key>`
    -   `Content-Type: application/json`
-   **Request Body (JSON):**
    ```json
    {
        "ip_address": "192.168.1.100",
        "port_protocol": "80/tcp" // Optional. If omitted, allows all traffic from the IP.
    }
    ```
-   **Description:** Adds a new 'allow' rule for traffic originating from a specific IP address. Optionally restricts the rule to a specific destination port/protocol.
-   **Example (`curl` - Allow all from IP):**
    ```bash
    curl -X POST -H "X-API-KEY: your-strong-secret-key-here" -H "Content-Type: application/json" \
    -d '{"ip_address": "192.168.1.100"}' http://localhost:8080/rules/allow/ip
    ```
-   **Example (`curl` - Allow from IP to port 80/tcp):**
    ```bash
    curl -X POST -H "X-API-KEY: your-strong-secret-key-here" -H "Content-Type: application/json" \
    -d '{"ip_address": "192.168.1.100", "port_protocol": "80/tcp"}' http://localhost:8080/rules/allow/ip
    ```
-   **Success Response:**
    ```json
    {
        "message": "Allow rule from IP added successfully",
        "ip_address": "192.168.1.100",
        "port_protocol": "80/tcp" // or "" if not provided
    }
    ```
-   **Error Responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`

---

### 9. Add Deny Rule From IP

-   **Method:** `POST`
-   **Path:** `/rules/deny/ip`
-   **Headers:**
    -   `X-API-KEY: <your-api-key>`
    -   `Content-Type: application/json`
-   **Request Body (JSON):**
    ```json
    {
        "ip_address": "10.0.0.5",
        "port_protocol": "" // Optional. If omitted, denies all traffic from the IP.
    }
    ```
-   **Description:** Adds a new 'deny' rule for traffic originating from a specific IP address. Optionally restricts the rule to a specific destination port/protocol.
-   **Example (`curl` - Deny all from IP):**
    ```bash
    curl -X POST -H "X-API-KEY: your-strong-secret-key-here" -H "Content-Type: application/json" \
    -d '{"ip_address": "10.0.0.5"}' http://localhost:8080/rules/deny/ip
    ```
-   **Example (`curl` - Deny from IP to port 22):**
    ```bash
    curl -X POST -H "X-API-KEY: your-strong-secret-key-here" -H "Content-Type: application/json" \
    -d '{"ip_address": "10.0.0.5", "port_protocol": "22"}' http://localhost:8080/rules/deny/ip
    ```
-   **Success Response:**
    ```json
    {
        "message": "Deny rule from IP added successfully",
        "ip_address": "10.0.0.5",
        "port_protocol": "" // or the specified port/proto
    }
    ```
-   **Error Responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`
