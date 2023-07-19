FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
EXPOSE 8080
RUN npm run tsc
COPY ./.env /app/build
CMD ["node","build/server.js"]