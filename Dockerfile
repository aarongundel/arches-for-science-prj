FROM python:3.9-slim as base 

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y make software-properties-common

RUN set -ex \
    && RUN_DEPS=" \
        build-essential \
        mime-support \
        libgdal-dev \
        postgresql-client-12 \
        dos2unix \
        git \
    " \
    && apt-get install -y --no-install-recommends curl \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \        
    && curl -sL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && add-apt-repository "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main" \
    && apt-get update -y \
    && apt-get install -y --no-install-recommends $RUN_DEPS \
    && apt-get install -y nodejs

# install dependencies
RUN pip install --upgrade pip
COPY ./afs/install/requirements.txt .
RUN pip install -r requirements.txt
RUN pip install arches

# copy project
COPY . .

WORKDIR /usr/src/app/afs

RUN ls && npm cache clean -f && rm -rf node_modules 
RUN npm install --verbose

USER afs