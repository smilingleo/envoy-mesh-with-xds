FROM node:8.5.0-alpine

RUN mkdir -p /opt/app
COPY package.json index.js /opt/app/

WORKDIR /opt/app/
RUN npm install
CMD node index.js
EXPOSE 3000
