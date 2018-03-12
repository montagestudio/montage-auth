# montage-auth

Montage-auth services stack.

## Prerequisites

### 1. Software

* Docker (version 17.03+) - Run software packaged into isolated containers.
[Docker](https://www.docker.com/) must be installed before you can use docker sample.

### Quick Start

To start montage-auth

```
# Clone montage-auth repository
git clone git@github.com:montagestudio/montage-auth.git
cd montage-auth
```

#### Start and deploy

```
# npm run build
docker build docker/montage-auth-service -t montagestudio/montage-auth-service:develop-SNAPSHOT

# npm run start:swarm
docker swarm init

# npm run start:stack
docker stack deploy -c montage-auth-stack.yaml 'montage-auth'

# npm run start:doc
open https://localhost/swagger.html
```

#### Shutdown stack

```
# npm run stop:swarm
docker swarm leave --force
```

## Montage Auth REST API

See swagger Documentation: [Montage Auth REST API swagger.yml](./docker/montage-auth-service/swagger.yml).

## Troubleshooting & Useful Tools

### TLTR;
```
git clone git@github.com:montagestudio/montage-auth.git
cd montage-auth
npm i
npm run build
npm run start
sleep 20
npm run start:doc
```

### ENV config

```
# Montage Auth App
APP_SECRET: '***'
APP_SSL: 'false'
APP_PORT: '80'
APP_HOST: 'auth.local-aurora.montagestudio.com'
APP_URL: 'http://auth.local-aurora.montagestudio.com'

# JWT config
JWKS_URI: 'https://testenterprise.disasteraware.com/jwt/jwks.json'
JWKS_ISSUER: 'https://testenterprise.disasteraware.com/jwt/jwks.json'

# Zendesk config
ZENDESK_SUBDOMAIN: disasteraware
ZENDESK_CLIENT_ID: disasteraware
ZENDESK_CLIENT_SECRET: '***'
ZENDESK_TOKEN_SECRET: '***'
ZENDESK_TOKEN_ALGORITHM: 'HS256'
ZENDESK_TOKEN_DURATION: '1h'

# Twitter
TWITTER_CONSUMER_KEY: 'YYmrT8z8xBsAMBWJeqhhmnxXD'
TWITTER_CONSUMER_SECRET: 'KmNYBsjmnEHlIghivYKFcbqGu4dSxzQ7qOvGFtMIYb1zirwkbi'
```

### Docker visualizer 

```
# To start visualizer for Docker Swarm and Services Status 
# Install image bellow, then visit http://localhost:5001/ or http://192.168.99.100:5001/ (if using Docker Machine on Mac)
docker run -it -d -p 5001:8080 -v /var/run/docker.sock:/var/run/docker.sock --name docker-visualizer dockersamples/visualizer

# To shutdown visualizer for Docker Swarm and Services Status 
# Install image bellow, then visit http://localhost:5001/ or http://192.168.99.100:5001/ (if using Docker Machine on Mac)
docker stop docker-visualizer
docker rm docker-visualizer
```

### Update montage-auth

```
# Pull changes from main repository and submodules (in demos)
git pull
git submodule update --init --recursive
```

### Publish to docker repository

```
# Build imnage
docker build docker/montage-auth-service -t montage-auth-service

# Login
export DOCKER_ID_USER="username"
docker login

# Tag Image
docker tag "montage-auth-service" "$DOCKER_ID_USER/montage-auth-service"

# Push Image
docker push $DOCKER_ID_USER/montage-auth-service

# Pull Image
docker pull $DOCKER_ID_USER/montage-auth-service:latest

# Run Image
docker run -p 8080:8080 montage-auth-service

# Then open https://localhost:8080/swagger.html to check service.
```

### Repository access

To clone this git repository, Github require from you to deploy an ssh-key for authentication:
- https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/
- https://developer.github.com/guides/managing-deploy-keys/#deploy-keys

## License

Copyright 2007-2017, Kaazing Corporation. All rights reserved.
