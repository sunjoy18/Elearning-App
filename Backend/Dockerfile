FROM node:18

WORKDIR /ElearningBackend

COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY db.js .
COPY index.js .
COPY .env .

COPY package*.json .

RUN npm install

EXPOSE 5000
CMD ["node", "index.js"]
