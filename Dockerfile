FROM node:20-alpine as build

RUN apk update && apk upgrade && \
  apk add --no-cache bash git openssh yarn

RUN mkdir /app

WORKDIR /app

COPY package.json .

RUN yarn install

COPY . .

RUN yarn run build-docker-bundle

# ---------------

FROM node:20-alpine

RUN mkdir -p /app/build

RUN apk update && apk upgrade && apk add yarn git

WORKDIR /app

COPY --from=build /app/package.json .

RUN yarn install --production

ARG CACHEBUST=1

COPY --from=build /app/build ./build
COPY --from=build /app/.env.docker ./.env
COPY --from=build /app/client-server.js .
COPY --from=build /app/service ./service
COPY --from=build /app/public ./public
COPY --from=build /app/src ./src


EXPOSE 3000
EXPOSE 3001

ENV SERVER_PORT=3000
ENV API_PORT=3001
ENV NODE_ENV production

CMD ["yarn", "prod"]
