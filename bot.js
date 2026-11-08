const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN; // Токен вашего бота из BotFather
const bot = new TelegramBot(token, { polling: true });

// Ссылка на ваш запущенный мини-апп на Render
const WEB_APP_URL = 'https://telegram-app-3z8h.onrender.com';

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    const welcomeText = 
`👋 Привет! Я **LinguaGPT** — твой помощник в трёх направлениях:

📚 **Английский язык** — курсы и материалы для роста с любого уровня
🤖 **GPT-промпты** — готовая база промптов для работы, учёбы и жизни
💰 **Финансовая грамотность** — практические курсы и полезные материалы

Внутри: каталог курсов, подборки материалов, быстрая оплата и доступ прямо в боте.

Выбери, с чего начнём 👇`;

    const replyMarkup = {
        inline_keyboard: [
            [{ text: '🚀 Открыть LinguaGPT Mini App', web_app: { url: WEB_APP_URL } }]
        ]
    };

    try {
        // Отправляем картинку-баннер с текстом и кнопкой
        await bot.sendPhoto(chatId, './banner.png', {
            caption: welcomeText,
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
        });
    } catch (error) {
        console.error('Ошибка отправки фото:', error);
        // Резервный вариант, если вдруг картинка не найдена
        await bot.sendMessage(chatId, welcomeText, {
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
        });
    }
});

console.log('Telegram bot is running...');
