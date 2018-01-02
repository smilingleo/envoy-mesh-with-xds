FROM node:8.5.0-alpine

RUN mkdir -p /opt/app
COPY package.json /opt/app/

WORKDIR /opt/app/
RUN npm install
EXPOSE 3000
