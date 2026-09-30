FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Setting development mode explicitly since this is mapped with a volume
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
