# Copyright 2007-2017, Kaazing Corporation. All rights reserved.
# montage-data-service docker
FROM node:7.9.0

RUN mkdir /home/montage-data-service
WORKDIR  /home/montage-data-service

# Install package
ADD package.json ./
RUN npm install

# Import certs
RUN mkdir certs
ADD certs/private.key certs/private.key
ADD certs/public.crt certs/public.crt

# Then add source after install
ADD index.js index.js
ADD middleware middleware
ADD public public

EXPOSE 8080

CMD ["node", "index.js"]