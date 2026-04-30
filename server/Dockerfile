FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY index.js ./
COPY static ./static
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
