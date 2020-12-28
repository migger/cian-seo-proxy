FROM node:slim
COPY index.js .
COPY package.json .
RUN yarn --production
CMD node index.js
