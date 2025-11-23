#!/bin/sh
set -e

# 1. Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# 2. Collect static files
# Collect static files only if DJANGO_DEBUG is explicitly set to "0" (production mode)
if [ "$DJANGO_DEBUG" = "0" ]; then
  echo "Collecting static files..."
  python manage.py collectstatic --noinput
fi

# 3. Start the ASGI server
# Lệnh này sẽ thay thế tiến trình shell bằng tiến trình Daphne, giữ container chạy
echo "Starting Daphne ASGI server on 0.0.0.0:8000..."
# Thay thế 'backend.asgi:application' bằng tên dự án Django của bạn nếu nó khác 'backend'
exec daphne -b 0.0.0.0 -p 8000 backend.asgi:application