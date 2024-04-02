# Common build stage
FROM node:21-alpine3.18 as BetterRustPlus

COPY . ./app

WORKDIR /app

RUN apk update && apk add bash

RUN npm install

EXPOSE 3000

# RUN ["node", "deploy-commands.js"]

CMD node src/deploy-commands.js && npm run dev