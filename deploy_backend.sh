#!/bin/bash

GITHUB_REPO="gouryella/ufw-panel-backend"
GITHUB_API="https://api.github.com/repos/$GITHUB_REPO/releases/latest"

# 安装目录
INSTALL_DIR="/usr/local/bin"
EXECUTABLE_NAME="ufw-panel-backend"
EXECUTABLE_PATH="$INSTALL_DIR/$EXECUTABLE_NAME"
ENV_FILE="$INSTALL_DIR/.env_ufw_backend"
SERVICE_NAME="ufw-panel-backend"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

log_info() {
    echo "[INFO] $1"
}

log_error_exit() {
    echo "[ERROR] $1" >&2
    exit 1
}

check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        log_error_exit "此脚本需要以 root 权限运行。请使用 sudo ./deploy_backend.sh"
    fi
}

detect_arch() {
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64) ARCH="amd64" ;;
        aarch64 | arm64) ARCH="arm64" ;;
        *) log_error_exit "不支持的架构: $ARCH" ;;
    esac
    log_info "检测到架构: $ARCH"
}

fetch_latest_backend_url() {
    log_info "正在从 GitHub 获取最新版本信息..."

    DOWNLOAD_URL=$(curl -s "$GITHUB_API" | grep "browser_download_url" | grep "$ARCH" | grep "$EXECUTABLE_NAME" | cut -d '"' -f 4)

    if [ -z "$DOWNLOAD_URL" ]; then
        log_error_exit "未找到架构 $ARCH 的可用版本。"
    fi

    BACKEND_URL="$DOWNLOAD_URL"
    log_info "获取到下载链接: $BACKEND_URL"
}

prompt_port() {
    local default_port=8080
    read -p "请输入后端服务监听的端口 (默认为 $default_port): " port
    PORT=${port:-$default_port}
    if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
        log_error_exit "无效的端口号: $PORT"
    fi
    log_info "后端服务将监听端口: $PORT"
}

prompt_password() {
    read -s -p "请输入用于访问后端 API 的密码: " password
    echo
    if [ -z "$password" ]; then
        log_error_exit "密码不能为空。"
    fi
    read -s -p "请再次输入密码进行确认: " password_confirm
    echo
    if [ "$password" != "$password_confirm" ]; then
        log_error_exit "两次输入的密码不匹配。"
    fi
    PASSWORD=$password
    log_info "API 访问密码已设置。"
}

install_backend() {
    log_info "正在下载后端可执行文件..."
    if ! curl -L --progress-bar "$BACKEND_URL" -o "$EXECUTABLE_PATH"; then
        log_error_exit "下载失败，请检查网络或链接是否正确。"
    fi
    chmod +x "$EXECUTABLE_PATH"
    log_info "下载完成，已设置可执行权限。"
}

create_env_file() {
    log_info "创建环境变量文件 $ENV_FILE ..."
    printf "PORT=%s\n" "$PORT" > "$ENV_FILE"
    printf "PASSWORD=%s\n" "$PASSWORD" >> "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    log_info "环境变量文件创建成功。"
}

create_systemd_service() {
    log_info "创建 systemd 服务文件 $SERVICE_FILE ..."
    cat << EOF > "$SERVICE_FILE"
[Unit]
Description=UFW Panel Backend Service
After=network.target

[Service]
WorkingDirectory=$INSTALL_DIR
EnvironmentFile=$ENV_FILE
ExecStart=$EXECUTABLE_PATH
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
    log_info "服务文件已写入。"
}

enable_and_start_service() {
    log_info "重新加载 systemd..."
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    systemctl start "$SERVICE_NAME"
    sleep 2
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_info "服务 $SERVICE_NAME 启动成功。"
    else
        log_error_exit "服务启动失败，请使用 sudo journalctl -u $SERVICE_NAME 查看日志。"
    fi
}

main() {
    check_root
    detect_arch
    fetch_latest_backend_url
    prompt_port
    prompt_password
    install_backend
    create_env_file
    create_systemd_service
    enable_and_start_service

    echo
    log_info "✅ 后端部署完成！"
    log_info "服务名称: $SERVICE_NAME"
    log_info "监听端口: $PORT"
    log_info "执行路径: $EXECUTABLE_PATH"
    log_info "环境文件: $ENV_FILE"
    log_info "systemd 文件: $SERVICE_FILE"
    echo
    log_info "常用命令："
    log_info "  查看状态: sudo systemctl status $SERVICE_NAME"
    log_info "  停止服务: sudo systemctl stop $SERVICE_NAME"
    log_info "  启动服务: sudo systemctl start $SERVICE_NAME"
    log_info "  重启服务: sudo systemctl restart $SERVICE_NAME"
    log_info "  查看日志: sudo journalctl -u $SERVICE_NAME -f"
}

main
