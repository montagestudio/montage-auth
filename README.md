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

### Repository access

To clone this git repository, Github require from you to deploy an ssh-key for authentication:
- https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/
- https://developer.github.com/guides/managing-deploy-keys/#deploy-keys

## License

Copyright 2007-2017, Kaazing Corporation. All rights reserved.
