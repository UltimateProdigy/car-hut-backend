FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./


RUN npm install

COPY prisma ./prisma

ENV DATABASE_URL="postgresql://postgres:at108582@localhost:5432/carhut?schema=public"
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Or for production:
# CMD ["npm", "start"]