const express = require('express');
const User = require('../models/UserSchema');
const axios = require('axios');
const jwt = require('jsonwebtoken');


const SECRET = process.env.DB_SECRET;

const BRASHPAY_API_KEY = process.env.BRASHPAY_API_KEY;
const BRASHPAY_API_SECRET = process.env.BRASHPAY_API_SECRET;



async function handleTransactionAndBalance(requestData,req,res) {
    const { headers } = req;
    const authorization = headers.authorization || null;

    try {
        const response = await axios.post(
            'https://api.brashpay.com/v1/transactions/',    
            requestData,
            {
                auth: {
                    username: BRASHPAY_API_KEY,
                    password: BRASHPAY_API_SECRET,
                },
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-Id': '828fcf2c-cca0-45e5-b646-599fe19b2314'
                }
            }
        );
          console.log(response.data)

          if (response && response.data) {
            const { status, links } = response.data;
            switch (status) {

                case '  ':
                    res.status(500).json({ error: 'Payment was declined, try again' });
                    break;
                case 'Captured':
                    const amountValue = parseFloat(requestData.amount);
                    if (isNaN(amountValue) || amountValue < 10) {
                        throw new Error('Transaction amount must be 10 or more');
                    }
                    const creditsToAdd = Math.floor(amountValue * 10);
                    const decoded = jwt.verify(authorization.replace('Bearer ', ''), SECRET);
                    const userId = decoded.id;
                    const user = await User.findById(userId);
                    if (!user) {
                        throw new Error('User not found');
                    }
                    if (!user.balance) {
                        user.balance = 0; 
                    }
                    user.balance += creditsToAdd;
                    await user.save();
                    return { success: true, message: 'Transaction successful' };
                   
                case 'Pending':
                    const redirectUrl = response.data.links[0].href;
                    const transactionId = response.data.id;
                    const decodedP = jwt.verify(authorization.replace('Bearer ', ''), SECRET);
                    const userIdS = decodedP.id;
                    const userP = await User.findById(userIdS);
                    userP.TransactionIdPeding.push(transactionId);

                    await userP.save(); 
                    console.log(redirectUrl)
                        res.status(200).json({ redirectUrl,transactionId });
                    break;

                default:
                    throw new Error(`Unhandled transaction status: ${status}`);
            }
        } else {
            throw new Error('Failed to process transaction');
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to process transaction');
    }
}

async function checkPaymentStatus(req,res) {
   
    const { headers } = req;
    const authorization = headers.authorization || null;
    try {
        const decoded = jwt.verify(authorization.replace('Bearer ', ''), SECRET);
        const userId = decoded.id;
        const user = await User.findById(userId);
        const transactionId = user.TransactionIdPeding



        const response = await axios.get(
            `https://api.brashpay.com/v1/transactions/${transactionId}`,
            {
                auth: {
                    username: BRASHPAY_API_KEY,
                    password: BRASHPAY_API_SECRET,
                },
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-Id': '828fcf2c-cca0-45e5-b646-599fe19b2314'
                }
            }
        );        
        
        const status = response.data.status;
      
        
        if(!transactionId){
            return res.status(201).json({ success: true, message: 'No id' });
        }

      
        if (status === 'Captured') {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const amountValue = parseFloat(response.data.amount);
 
            if (isNaN(amountValue) || amountValue < 10) {
                throw new Error('Transaction amount must be 10 or more');
            }

            const creditsToAdd = Math.floor(amountValue * 10);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.balance) {
                user.balance = 0; 
            }
            user.TransactionIdPeding = '';
            user.balance += creditsToAdd;
            await user.save();

            return res.status(200).redirect(`${process.env.FRONTEND_URL}/profile`);

        } else if (status === 'Declined') {
            const user = await User.findById(userId);
            const transactionId = user.TransactionIdPeding
            if (!user) {
                throw new Error('User not found');
            }

            user.TransactionIdPeding = '';
            await user.save();

            return res.status(200).redirect(`${process.env.FRONTEND_URL}/`);

        } else {
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/`);
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to check payment status');
    }
}

module.exports = {
    handleTransactionAndBalance,
    checkPaymentStatus
};