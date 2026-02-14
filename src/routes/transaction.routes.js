const {Router} = require('express');
const transactionController = require("../controllers/transaction.controller");
const {middlewares} = require("../middleware/auth.middleware");

const transactionRoutes = Router();

transactionRoutes.post("/", middlewares.authMiddleware, transactionController.createTransactionController)
transactionRoutes.post("/system/initial-funds", middlewares.systemAuthMiddleware, transactionController.createInitialFundsTransaction)

module.exports = transactionRoutes;
