#!/bin/sh
set -e

# Ensure the /app/database directory exists (it should be the mount point)
mkdir -p /app/database

# Make the database directory and its contents world-writable INSIDE the container.
# This is a common workaround for volume permission issues.
# This runs as root before the CMD switches to the 'nextjs' user.
chmod -R 777 /app/database

# Hand off to the CMD
exec "$@"
