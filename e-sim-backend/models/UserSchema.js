
import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
    FirstName: {
        type: String,
        required: true,
    },
    LastName: {
        type: String,
        required: true,
    }, 
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: false,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now,
    },
    Plan: {
        type: String,
        default: 'Basic',
    },
    ActivePurchases: [{
        type: String
        // dobavit id, name uptime next renewal skolko v creditax img i t.d
    }],
    TransactionIdPeding: {
        type: String,
        default: ''
    },
    TransactionIdProducts: [{
        type: String,
    }],
    AutoRenewal: [{
        type: String,
        default: "Off"
    }],
    Country: {
        type: String,
        required: true
    }
})


export default mongoose.model('User', UserSchema)
