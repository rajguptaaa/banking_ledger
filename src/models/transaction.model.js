const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true, "Transaction must have a source account"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true, "Transaction must have a destination account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING", "SUCCESS", "FAILED", "REVERSED"],
            message:"Status must be either PENDING, SUCCESS, FAILED or REVERSED"
        },
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true, "Transaction must have an amount"],
        min:[0, "Amount must be greater than 1"]
    },
    idempotencyKey:{
        type:String,
        required: [true, "Idempotency key is required for transaction"],
        unique: true,
        index:true
    }
},{
    timestamps:true
});

const transactionModel =  mongoose.model("transaction", transactionSchema);
module.exports = transactionModel;

