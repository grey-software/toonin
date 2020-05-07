# Define the docker hub image: https://hub.docker.com/_/node/
FROM node:13.7-alpine

# Create app directory
RUN mkdir -p /usr/toonin/app
RUN mkdir -p /usr/toonin/server
WORKDIR /usr/toonin

# Install app dependencies
COPY ./packages/server/package.json /usr/toonin/server
COPY ./packages/app/package.json /usr/toonin/app

# Bundle app source
COPY . /usr/toonin
RUN (cd server && npm install) & (cd app && npm rebuild node-sass && npm install && npm run build)


CMD [ "npm", "start" ]
