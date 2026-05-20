# Utilizando a versão Alpine, que é muito mais leve
FROM node:18-alpine

WORKDIR /app

# Copia tanto o package.json quanto o package-lock.json
COPY package*.json ./

# Utiliza npm ci para instalações limpas baseadas no lockfile
RUN npm ci

COPY . .

EXPOSE 3000

# Executa o container com utilizador não-root por questões de segurança
USER node

CMD ["node", "server.js"]