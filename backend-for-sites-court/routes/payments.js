const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const {handleTransactionAndBalance, checkPaymentStatus} = require("../controller/payments.controller")

router.use(bodyParser.json());


router.post('/create-transaction', async (req, res) => {
    try {
        const requestData = req.body;
        const result = await handleTransactionAndBalance(requestData, req, res); 
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/check-payments',checkPaymentStatus)

module.exports = router;