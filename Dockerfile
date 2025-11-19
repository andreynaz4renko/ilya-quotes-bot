# Многоступенчатая сборка для оптимизации размера образа
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY src/ ./src/

# Собираем проект
RUN npm run build

# Финальный образ
FROM node:20-alpine

WORKDIR /app

# Копируем package.json для установки только production зависимостей
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем собранный код из builder
COPY --from=builder /app/dist ./dist

# Запускаем приложение
CMD ["npm", "start"]

