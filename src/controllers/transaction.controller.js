const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

async function createTransactionController(req, res) {

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            error: "Missing required fields"
        })
    }

    const session = await mongoose.startSession();
    session.startTransaction()
    
    try {
        const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey: idempotencyKey }).session(session)
        if (isTransactionAlreadyExists) {
            await session.abortTransaction();
            session.endSession();
            if (isTransactionAlreadyExists.status === "SUCCESS") {
                return res.status(409).json({ message: "Transaction with this idempotency key already exists and was successful" })
            }
            if (isTransactionAlreadyExists.status === "PENDING") {
                return res.status(409).json({ message: "Transaction is still processing, please wait" })
            }
            if (isTransactionAlreadyExists.status === "FAILED") {
                return res.status(409).json({ message: "Transaction processing failed" })
            }
            if (isTransactionAlreadyExists.status === "REVERSED") {
                return res.status(409).json({ message: "Transaction was reversed, please retry" })
            }
        }

        const fromUserAccount = await accountModel.findOne({ _id: fromAccount }).session(session)
        const toUserAccount = await accountModel.findOne({ _id: toAccount }).session(session);

        if (!fromUserAccount || !toUserAccount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Invalid fromAccount or toAccount" });
        }

        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Both accounts must be active to perform a transaction" })
        }

        const balance = await fromUserAccount.getBalance();
        if (balance < amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Insufficient balance: current balance is ${balance}` });
        }

        const transaction = await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session })

        await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            type: "DEBIT",
            transaction: transaction[0]._id
        }], { session })

        await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            type: "CREDIT",
            transaction: transaction[0]._id
        }], { session })
        
        transaction[0].status = "SUCCESS"
        await transaction[0].save({ session })
        await session.commitTransaction();
        session.endSession();

        await emailService.sendTransactionEmail(fromUserAccount.userId.email, "Transaction Successful", `Your transaction of ${amount} was successful`);

        await emailService.sendTransactionEmail(toUserAccount.userId.email, "Transaction Successful", `You have received ${amount} from ${fromUserAccount.userId.name}`);

        return res.status(201).json({ transaction: transaction[0] });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: "Transaction failed, please try again", error: error.message });
    }
}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields"
        })
    }
    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })
    if (!toUserAccount) {
        return res.status(404).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        systemUser: true,
        userId: req.user._id
    })
    if (!fromUserAccount) {
        return res.status(404).json({
            message: "System account not found for the user"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const transaction = await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session })

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction[0]._id,
            type: "DEBIT"
        }], { session })

        await ledgerModel.create([{
            account: toUserAccount._id,
            amount: amount,
            transaction: transaction[0]._id,
            type: "CREDIT"
        }], { session })

        transaction[0].status = "SUCCESS"
        await transaction[0].save({ session })
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Initial funds added successfully",
            transaction: transaction[0]
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: "Transaction failed", error: error.message });
    }



}
module.exports = {
    createTransactionController,
    createInitialFundsTransaction
}
