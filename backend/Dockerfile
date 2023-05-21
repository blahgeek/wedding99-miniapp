FROM docker.io/python:3.10

ENV PYTHONDONTWRITEBYTECODE=1

RUN mkdir -v /data /app
RUN pip install pipenv

ADD Pipfile.lock Pipfile /app/
WORKDIR /app
RUN pipenv sync --system
RUN python -c "import django; print(django.VERSION)"

COPY . /app

ENV DJANGO_DB_PATH /data/db.sqlite3
ENV DJANGO_STATIC_ROOT /app/static
ENV ADMIN_USER root
ENV ADMIN_EMAIL root@localhost
ENV ADMIN_PASSWD password

CMD ./run.sh

EXPOSE 8000
