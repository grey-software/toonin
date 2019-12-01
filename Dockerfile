# Define the docker hub image: https://hub.docker.com/_/node/
FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/app/client-redesign
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY ./client-redesign/package.json /usr/src/app/client-redesign
# Bundle app source
COPY . /usr/src/app
RUN npm install & (cd client-redesign && npm install && npm run build)


CMD [ "npm", "start" ]