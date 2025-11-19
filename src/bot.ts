import { Telegraf, Context } from "telegraf";

// Список названий цитат
const QUOTE_NAMES = [
  "Блять, Валиконите, заебала, блять, орать",
  "Сука, закройте свои еблаки, нахуй, блять",
  "ИДИ НАХУЙ, БЛЯТЬ",
  "Блять, сука, как ты меня заебал, просто",
  "Блять, да как не бомбить то?",
  "Да блять, пизда, нахуй",
  "Блять, не туда",
  "Хорошо, блять, не допускай, нахуй",
  "Да блять... сука",
  "Блять... вот... нахуй...",
  "Хорошо, хорошо, блять",
  "Допустил, блять, сука",
  "Ебать. Охуенное чудо, нахуй, спустилось с небес",
  "Благодатный огонь взошёл",
  "Блять, пожалуйста, можешь помолчать?",
  "Пожалуйста",
  "Чё ты да, блять?",
  "Они не хотели... как бы... портить с тобой отношения",
  "Типо про хуй пошутил",
  "Во, ебать, вот это поддержка",
  "Вот видите как надо поддерживать одногруппников?",
  "Да, блять",
  "Пиздец, блять... ну бля... охуенно, блять, вообще... я ебал, блять",
  "Ну блять, ну как так вообще, блять?",
  "Я никому не скажу",
  "Пошёл нахуй, блять!",
  "Или куда, блять?",
  "Блять, сука, просто, я ебал",
  "Блять, просто, вы ебанутые, нахуй",
  "Блять, ну как? Как такими тупыми пёздами можно, блять, быть, просто?",
  "Сука, кто выйдет отсюда - получит по ебалу",
  "Изи, блять",
  "Ебать, жоские мемы",
  "Хорошо, хорошо",
  "Спасибо",
  "Не отправляйте щас, пожалуйста, ничего",
  "Наебал",
  "Это ебало орущего человека, нахуй. Смотрите, блять",
  "Посмотрите как он орёт!",
  "Каво, нахуй? Окно?",
  "Вот, Настя, мы с тобой похожи",
  "Да блять, заебал, нахуй",
  "Карту кидай",
  "Слыш, блять? Давай, нахуй, подъезжай, блять",
  "Разберёмся по-пацански",
  "Это... Насть... ну ты это... не психуй",
  "Успокойся",
  "Ну блять, ну ладно, ну вообще... Это хорошая новость, вообще, прям!",
  "Нихуя, нихуя, нихуя, нихуя",
  "Ты сказала 'Нет'",
  "В чём прикол?",
  "Ну чё, пацаны, блять? Анимэ?",
  "Блять, заебал!",
];

export class Bot {
  private bot: Telegraf;
  private readonly STORAGE_BASE_URL =
    "https://storage.yandexcloud.net/priemka-storage";

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Обработчик команды /start
    this.bot.start((ctx: Context) => {
      ctx.reply(
        "Привет! Я инлайн-бот для цитат Ильи.\n\n" +
          "Используй меня в любом чате: начни вводить @имя_бота и выбери нужную цитату из списка."
      );
    });

    // Обработчик команды /help
    this.bot.help((ctx: Context) => {
      ctx.reply(
        "Доступные команды:\n" +
          "/start - Начать работу с ботом\n" +
          "/help - Показать эту справку\n\n" +
          "Для использования инлайн-режима:\n" +
          "1. Начни вводить @имя_бота в любом чате\n" +
          "2. Выбери нужную цитату из списка\n" +
          "3. Отправь голосовое сообщение"
      );
    });

    // Обработчик инлайн-запросов
    this.bot.on("inline_query", async (ctx) => {
      const query = ctx.inlineQuery?.query?.toLowerCase() || "";

      // Фильтруем результаты по запросу пользователя
      const filteredQuotes = QUOTE_NAMES.map((name, index) => ({
        name,
        index,
      })).filter(({ name }) => name.toLowerCase().includes(query));

      // Создаем результаты для инлайн-запроса с использованием URL из Yandex Cloud Storage
      // Telegram ограничивает количество результатов до 50
      const results = filteredQuotes.slice(0, 50).map(({ name, index }) => {
        // Формируем URL для файла из Yandex Cloud Storage
        const fileUrl = `${this.STORAGE_BASE_URL}/a${index}.ogg`;

        return {
          type: "voice" as const,
          id: `quote_${index}`,
          title: name,
          voice_url: fileUrl,
        };
      });

      try {
        await ctx.answerInlineQuery(results, {
          cache_time: 3600, // Кэшируем результаты на 1 час
        });
      } catch (error) {
        console.error("Ошибка при отправке инлайн-результатов:", error);
      }
    });

    // Обработчик выбора результата (опционально, для статистики)
    this.bot.on("chosen_inline_result", (ctx) => {
      const resultId = ctx.chosenInlineResult?.result_id;
      if (resultId) {
        const index = parseInt(resultId.replace("quote_", ""));
        console.log(
          `Пользователь выбрал цитату #${index}: ${QUOTE_NAMES[index]}`
        );
      }
    });

    // Обработчик ошибок
    this.bot.catch((err: any, ctx: Context) => {
      console.error(`Ошибка для пользователя ${ctx.from?.id}:`, err);
      if (ctx.callbackQuery || ctx.inlineQuery) {
        // Для инлайн-запросов не отправляем сообщение об ошибке
        return;
      }
      ctx.reply("Произошла ошибка. Попробуйте позже.");
    });
  }

  public start(): void {
    this.bot
      .launch()
      .then(() => {
        console.log("Бот успешно запущен!");
      })
      .catch((error) => {
        console.error("Ошибка при запуске бота:", error);
        process.exit(1);
      });

    // Graceful shutdown
    process.once("SIGINT", () => this.stop("SIGINT"));
    process.once("SIGTERM", () => this.stop("SIGTERM"));
  }

  private stop(signal: string): void {
    console.log(`Получен сигнал ${signal}, останавливаем бота...`);
    this.bot.stop(signal);
    process.exit(0);
  }
}
