# Define the docker hub image: https://hub.docker.com/_/node/
FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/app/client
RUN mkdir -p /usr/src/app/deployment
WORKDIR /usr/src/app

# Install app dependencies
COPY ./deployment/package.json /usr/src/app/deployment
COPY ./client/package.json /usr/src/app/client
# Bundle app source
COPY . /usr/src/app
RUN (cd deployment && npm install) & (cd client && npm install && npm run build)


CMD [ "npm", "start" ]