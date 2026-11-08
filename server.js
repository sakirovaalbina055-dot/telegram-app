const express = require('express');
const path = require('path');
const app = express();

// Раздаем статику Mini App
app.use(express.static(path.join(__dirname, 'public')));

// Подключаем маршруты оплаты
const paymentRoutes = require('./routes/payment');
app.use(paymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
