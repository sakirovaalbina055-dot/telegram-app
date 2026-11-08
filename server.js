const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Инициализация Telegram-бота (если задан BOT_TOKEN)
const token = process.env.BOT_TOKEN;
if (token) {
    const bot = new TelegramBot(token, { polling: true });
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
            // Отправляем картинку с текстом (убедитесь, что banner.png загружен в корень проекта)
            await bot.sendPhoto(chatId, './banner.png', {
                caption: welcomeText,
                parse_mode: 'Markdown',
                reply_markup: replyMarkup
            });
        } catch (error) {
            console.error('Ошибка отправки фото в боте:', error);
            await bot.sendMessage(chatId, welcomeText, {
                parse_mode: 'Markdown',
                reply_markup: replyMarkup
            });
        }
    });
    console.log('Telegram bot started successfully.');
} else {
    console.log('BOT_TOKEN not found, bot is disabled.');
}

// 2. Настройка веб-сервера для Mini App и оплаты
app.use(express.static(path.join(__dirname, 'public')));

// Подключаем маршруты оплаты
const paymentRoutes = require('./routes/payment');
app.use(paymentRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
