const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// اتصال به دیتابیس
mongoose.connect('mongodb://localhost:27017/exchangeApp');

// مسیرها
app.use('/auth', require('./routes/auth'));
app.use('/wallet', require('./routes/wallet'));
app.use('/trade', require('./routes/trade'));
app.use('/prices', require('./routes/prices'));

app.listen(3000, () => console.log("Exchange backend running on port 3000"));