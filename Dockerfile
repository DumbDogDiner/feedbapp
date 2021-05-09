FROM node:16-alpine
# set work
WORKDIR /app
# copy package info and install deps
COPY package.json .
RUN yarn
# copy source code
COPY . .
# set environment - define here to prevent yarn from installing prod
ENV NODE_ENV=production
# run 
CMD ["yarn", "start"]
