FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

WORKDIR /app/public

RUN npm install

WORKDIR /app

EXPOSE 8080
CMD [ "node", "server.js" ]