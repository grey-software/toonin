# Define the docker hub image: https://hub.docker.com/_/node/
FROM node:alpine

# Create app directory
RUN mkdir -p /usr/toonin/app
RUN mkdir -p /usr/toonin/deployment
WORKDIR /usr/toonin

# Install app dependencies
COPY ./deployment/package.json /usr/toonin/deployment
COPY ./app/package.json /usr/toonin/app

# Bundle app source
COPY . /usr/toonin
RUN (cd deployment && npm install) & (cd app && npm install && npm run build)


CMD [ "npm", "start" ]