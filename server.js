require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'database.json');
function getDB() {
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({}));
    try {
        return JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) {
        return {};
    }
}
function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Telegram /start handler
bot.start((ctx) => {
    const webAppUrl = process.env.APP_URL || 'https://google.com';
    ctx.reply('Привет! 👋 Добро пожаловать в Lingua & AI Hub.\n\nНажмите кнопку ниже, чтобы открыть приложение:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }]
            ]
        }
    });
});

// Check user payment status
app.get('/api/status/:userId', (req, res) => {
    const db = getDB();
    const userId = req.params.userId;
    const user = db[userId] || { paid: false };
    res.json(user);
});

// YooMoney Webhook Notice Handler
app.post('/webhook/yoomoney', (req, res) => {
    const {
        notification_type,
        operation_id,
        amount,
        currency,
        datetime,
        sender,
        codepro,
        notification_secret,
        label,
        sha1_hash
    } = req.body;

    const secret = process.env.YOOMONEY_SECRET;
    const checkString = `${notification_type}&${operation_id}&${amount}&${currency}&${datetime}&${sender}&${codepro}&${secret}&${label}`;
    const calculatedHash = crypto.createHash('sha1').update(checkString).digest('hex');

    if (calculatedHash === sha1_hash && !codepro) {
        const userId = label ? label.split('_')[0] : null;
        if (userId) {
            const db = getDB();
            db[userId] = { paid: true, updatedAt: new Date().toISOString() };
            saveDB(db);

            bot.telegram.sendMessage(userId, '✅ Оплата успешно получена! Все функции приложения разблокированы. Откройте приложение снова.').catch(console.error);
        }
    }
    res.status(200).send('OK');
});

// Manual test bypass (for testing purposes)
app.post('/api/verify-manual', (req, res) => {
    const { userId } = req.body;
    if (userId) {
        const db = getDB();
        db[userId] = { paid: true, updatedAt: new Date().toISOString() };
        saveDB(db);
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Missing userId' });
    }
});

bot.launch().then(() => console.log('Bot successfully started!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
