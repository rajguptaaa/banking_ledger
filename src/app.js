const express = require('express');
const cookieParser = require("cookie-parser");
const authRouter = require('../src/routes/auth.routes');
const accountRouter = require('../src/routes/account.routes');
const transactionRoutes = require('../src/routes/transaction.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/transaction", transactionRoutes);

module.exports = app;