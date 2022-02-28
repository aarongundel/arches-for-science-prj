FROM python:3.8-bullseye
RUN apt-get update 
RUN apt-get install apache2 apache2-dev vim -y && pip install --no-cache-dir mod_wsgi
RUN set -ex \
    && RUN_DEPS=" \
        build-essential \
        python3.8-dev \
        mime-support \
        libgdal-dev \
        python3-venv \
        postgresql-client-12 \
        dos2unix \
    " \
    && apt-get install -y --no-install-recommends curl \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && curl -sL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && apt-get update -y \
    && apt-get install -y --no-install-recommends $RUN_DEPS \
    && apt-get install -y nodejs \
    && npm install -g yarn

RUN pip install arches
WORKDIR /etc/apache2/conf-available
COPY docker/apache/arches-default.conf /etc/apache2/sites-available
RUN mod_wsgi-express module-config >> mod_wsgi.conf && a2enconf mod_wsgi && a2dissite 000-default && a2ensite arches-default
RUN a2enmod lbmethod_byrequests && mkdir /opt/afs
COPY . /usr/share/afs
WORKDIR /usr/share/afs/
RUN  export $(grep -v '^#' /usr/share/afs/docker/apache/environment.env | xargs) && echo $DJANGO_MODE && python manage.py collectstatic --noinput
RUN chown -R www-data /static_root && cd afs && yarn install
ENTRYPOINT [ "/usr/sbin/apache2ctl", "-D", "FOREGROUND" ]