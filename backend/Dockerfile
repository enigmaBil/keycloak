FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm run prisma:generate

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "npm run prisma:deploy && npm run start:dev"]