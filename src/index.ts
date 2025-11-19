import dotenv from "dotenv";
import { Bot } from "./bot";

// Загружаем переменные окружения
dotenv.config();

// Проверяем наличие токена
if (!process.env.BOT_TOKEN) {
  console.error("Ошибка: BOT_TOKEN не установлен в переменных окружения!");
  process.exit(1);
}

// Создаем и запускаем бота
const bot = new Bot(process.env.BOT_TOKEN);
bot.start();
