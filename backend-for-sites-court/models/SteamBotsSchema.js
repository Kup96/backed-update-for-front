const mongoose = require('mongoose')

const SteamBot = new mongoose.Schema({

    steamId: {
        type: String,
    },
    username:{
        type:String,
    },
    password:{
        type:String,
    },
    proxy:{
        type:String,
        required: false,
        default: null
    },
    proxyType: {
        type: String,
        required: false,
        default: null
    },
    proxyAddedDate: {
        type: Date,
        default: Date.now,
    },
    proxyLifetimeDays: {
        type: Number,
        default: 3,
    },
    proxyFinishDate: {
        type: Date,
        required: false,
        default: null
    },
    proxyStatus: {
        type: String,
        required: false,
        default: null
    },
    sharedSecret: {
        type: String,
    },
    identitySecret: {
        type: String,
    },
    reminder: {
        type: String,
    },
    mail: {
        type: String,
    },
    mailPassword: {
        type: String,
    },
    statusOff: {
        type: Boolean,
    },
    currentStatus: {
        type: String,
    },
    isBanned: {
        type: Boolean,
    },
    attempt: {
        type: Number,
    },
    items: {
        type: [{type: String}],
    },
    tradeLinkOffer: {
        type: String,
    },
})

const Bot = mongoose.model('Bot', SteamBot)

module.exports = Bot
