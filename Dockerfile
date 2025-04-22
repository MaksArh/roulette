FROM node:18-alpine

WORKDIR /app

# Копирование файлов package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода приложения
COPY . .

# Сборка TypeScript в JavaScript
RUN npm run build

# Открытие порта
EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"] 