const crypto = require('crypto');
const express = require('express');
const router = express.Router();

const MERCHANT_ID = process.env.FK_MERCHANT_ID;
const SECRET_1 = process.env.FK_SECRET_1;
const SECRET_2 = process.env.FK_SECRET_2;

// Создание ссылки на оплату с правильным доменом pay.freekassa.ru
router.post('/api/payment/create', express.json(), (req, res) => {
    try {
        const { amount, orderId } = req.body; 
        if (!amount || !orderId) {
            return res.status(400).json({ success: false, error: 'Missing amount or orderId' });
        }

        const currency = 'RUB';
        const signString = `${MERCHANT_ID}:${amount}:${SECRET_1}:${currency}:${orderId}`;
        const signature = crypto.createHash('md5').update(signString).digest('hex');

        // Официальный домен платежной формы FreeKassa
        const paymentUrl = `https://pay.freekassa.ru/?merchant_id=${MERCHANT_ID}&amount=${amount}&currency=${currency}&o=${orderId}&s=${signature}`;

        res.json({ success: true, paymentUrl });
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Webhook от FreeKassa
router.post('/api/payment/webhook', express.urlencoded({ extended: true }), (req, res) => {
    try {
        const { merchant_id, amount, intid, merchant_order_id, sign } = req.body;

        if (merchant_id !== MERCHANT_ID) {
            return res.status(400).send('WRONG_MERCHANT');
        }

        const signString = `${merchant_id}:${amount}:${SECRET_2}:${merchant_order_id}`;
        const localSign = crypto.createHash('md5').update(signString).digest('hex');

        if (localSign !== sign) {
            console.error('Invalid FreeKassa signature');
            return res.status(400).send('WRONG_SIGNATURE');
        }

        console.log(`Заказ #${merchant_order_id} на сумму ${amount} RUB успешно оплачен!`);
        res.send('YES');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('ERROR');
    }
});

router.get('/success', (req, res) => {
    res.send('<h2>Оплата прошла успешно! Можете вернуться в Telegram-бот.</h2>');
});

router.get('/fail', (req, res) => {
    res.send('<h2>Оплата была отменена или произошла ошибка.</h2>');
});

module.exports = router;
