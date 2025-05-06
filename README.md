# UFW Web UI

这是一个用于管理 UFW (Uncomplicated Firewall) 的 Web 界面项目，包含一个 Go 语言编写的后端和一个 Next.js 编写的前端。

## 功能

*   查看 UFW 状态（启用/禁用）
*   启用/禁用 UFW
*   查看 UFW 规则列表
*   添加 UFW 规则（允许/拒绝端口，允许/拒绝 IP 地址）
*   删除 UFW 规则
*   密码认证保护

## 项目结构

```
.
├── backend/         # Go 后端代码
│   ├── main.go
│   ├── ufw.go
│   ├── go.mod
│   └── ...
├── frontend/        # Next.js 前端代码
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
├── deploy_backend.sh # 后端一键部署脚本 (Linux)
└── README.md        # 项目总 README
```

## 部署

### 后端 (Linux)

1.  **下载部署脚本:**
    ```bash
    wget https://raw.githubusercontent.com/your-repo/ufw_webui/main/deploy_backend.sh # 请替换为实际的仓库地址
    chmod +x deploy_backend.sh
    ```

2.  **执行部署脚本:**
    该脚本会自动下载预编译的后端可执行文件，设置权限，并创建一个 systemd 服务来管理后端进程。
    ```bash
    sudo ./deploy_backend.sh
    ```
    脚本将提示您设置后端服务的监听端口和访问密码。

3.  **管理后端服务:**
    *   启动服务: `sudo systemctl start ufw-control-backend`
    *   停止服务: `sudo systemctl stop ufw-control-backend`
    *   重启服务: `sudo systemctl restart ufw-control-backend`
    *   查看服务状态: `sudo systemctl status ufw-control-backend`
    *   查看服务日志: `sudo journalctl -u ufw-control-backend -f`

**注意:** 后端可执行文件下载地址为: `https://85954ad8914b7.201lab.top/ufw-control-backend`。部署脚本会自动处理下载。

### 前端

前端是一个标准的 Next.js 应用。您可以按照 Next.js 的标准方式进行部署（例如使用 Vercel, Netlify, 或自托管）。

1.  **安装依赖:**
    ```bash
    cd frontend
    npm install # 或者 yarn install
    ```

2.  **配置环境变量:**
    在 `frontend/` 目录下创建一个 `.env.local` 文件，并设置后端 API 地址：
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://<your-backend-server-ip>:<backend-port> # 替换为您的后端服务器 IP 和端口
    # 设置一个用于会话加密的密钥，请替换为强随机字符串
    AUTH_SECRET=your_strong_random_secret_string_here
    ```

3.  **构建应用:**
    ```bash
    npm run build # 或者 yarn build
    ```

4.  **启动应用:**
    ```bash
    npm start # 或者 yarn start
    ```
    或者使用 PM2 等进程管理器来运行。

## 使用

部署完成后，通过浏览器访问前端地址即可开始使用。首次访问需要输入您在后端部署时设置的密码进行认证。

## 开发

### 后端

*   需要 Go 环境。
*   进入 `backend/` 目录。
*   运行 `go run main.go` 启动开发服务器。

### 前端

*   需要 Node.js 和 npm/yarn 环境。
*   进入 `frontend/` 目录。
*   运行 `npm run dev` 或 `yarn dev` 启动开发服务器。
