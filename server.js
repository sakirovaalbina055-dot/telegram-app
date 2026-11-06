const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Раздаем статический HTML из папки public
app.use(express.static(path.join(__dirname, 'public')));

// База данных покупок в памяти (для теста)
const userPurchases = {};

// 1. Эндпоинт проверки покупок (исправляет ошибка Cannot GET)
app.get('/api/user-purchases', (req, res) => {
  const userId = req.query.userId || 'demo_user';
  res.json({ purchases: userPurchases[userId] || [] });
});

// 2. Эндпоинт создания платежа ЮMoney
app.post('/api/create-payment', (req, res) => {
  const { userId, courseId, amount } = req.body;
  
  // Номер вашего кошелька ЮMoney (замените при необходимости)
  const receiver = '410011234567890'; 
  const label = `${userId}_${courseId}_${Date.now()}`;
  
  // Ссылка быстрой оплаты ЮMoney (Quickpay)
  const paymentUrl = `https://yoomoney.ru/quickpay/confirm?receiver=${receiver}&quickpay-form=button&sum=${amount}&label=${label}&target=Курс_${courseId}`;

  res.json({ paymentUrl });
});

// Запасной маршрут для раздачи index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
