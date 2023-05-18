#!/bin/sh

cp /data/config.py ./wedding99/config.py

./manage.py collectstatic --noinput
./manage.py migrate --noinput
./manage.py shell <<EOF
import os
from django.contrib.auth import get_user_model

User = get_user_model()
User.objects.create_superuser(os.environ['ADMIN_USER'], os.environ['ADMIN_EMAIL'], os.environ['ADMIN_PASSWD'])
EOF

unset ADMIN_USER
unset ADMIN_EMAIL
unset ADMIN_PASSWD

nginx
exec uwsgi --module=wedding99.wsgi:application --socket=0.0.0.0:8000 --processes=1 --enable-threads
