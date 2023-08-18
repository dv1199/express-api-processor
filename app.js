const express = require('express');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares');

const app = express();

require('dotenv').config();

app.use(bodyParser.json());

const orderRoutes = require('./routes');

app.use('/api/kitchen', orderRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;