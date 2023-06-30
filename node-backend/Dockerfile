FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
#RUN npm test
EXPOSE 3000
RUN npm run tsc
CMD ["node","src/server.js"]