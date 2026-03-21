FROM --platform=linux/amd64 node:20
USER root
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g tsx
COPY . .
EXPOSE 3001
CMD ["tsx", "src/server.ts"]
