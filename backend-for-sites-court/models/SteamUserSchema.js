const mongoose = require('mongoose')

const SteamUser = new mongoose.Schema({
    
    steamId: {
        type: String,
    },
    username:{
        type:String,
    },
    profileurl: {
        type: String,
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
    TransactionIdPeding: [{
        type: String
    }],
    TradeLink: {
        type: String,
        default: null
    },
    AutoRenewal: [{
        type: String,
        default: "Off"
    }]
})

const Steam = mongoose.model('Steam', SteamUser)

module.exports = Steam
