# Define the docker hub image: https://hub.docker.com/_/node/
FROM node:13.7-alpine

# Create app directory
RUN mkdir -p /usr/toonin

# Bundle app source
COPY . /usr/toonin
WORKDIR /usr/toonin

RUN yarn run setup
RUN yarn run rebuild
RUN yarn run build

CMD [ "npm", "start" ]
