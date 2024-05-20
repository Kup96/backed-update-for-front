const express = require('express');
const Steam = require('../models/SteamUserSchema');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const BRASHPAY_API_KEY = process.env.BRASHPAY_API_KEY;
const BRASHPAY_API_SECRET = process.env.BRASHPAY_API_SECRET;

async function handleTransactionAndBalance(requestData, req, res) {
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

        if (response && response.data) {
            const { status, links } = response.data;
            switch (status) {
                case '':
                    res.status(500).json({ error: 'Payment was declined, try again' });
                    break;
                case 'Captured':
                    const amountValue = parseFloat(requestData.amount);
                    if (isNaN(amountValue) || amountValue < 10) {
                        res.status(400).json('Transaction amount must be 10 or more');
                    }
                    const creditsToAdd = Math.floor(amountValue * 10);
                    const userId = req.user._id;
                    const user = await Steam.findById(userId);
                    if (!user) {
                        res.status(400).json('User not found');
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
                    const userIdS = req.user._id;
                    const userP = await Steam.findById(userIdS);
                    userP.TransactionIdPeding = transactionId;
                    await userP.save();
                    console.log(redirectUrl)
                    res.status(200).json({ redirectUrl: redirectUrl, transactionId: transactionId });
                    break;
                default:
                    res.status(200).json(`Unhandled transaction status: ${status}`);
            }
        } else {
            res.status(400).json('Failed to process transaction');
        }
    } catch (error) {
        console.error(error);
        console.log(error);
        console.log(error.data)
        res.status(400).json('Failed to process transaction');
    }
}

async function checkPaymentStatus(req, res) {
    try {



        const userId = req.user._id;
        const user = await Steam.findById(userId);
        const transactionId = user.TransactionIdPeding;
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

        if (!transactionId) {
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/`);
            // return res.status(201).json({ success: true, message: 'No id' });
        }

        if (status === 'Captured') {
            const amountValue = parseFloat(response.data.amount);
            if (isNaN(amountValue) || amountValue < 10) {
                res.status(400).json('Transaction amount must be 10 or more');
            }
            const creditsToAdd = Math.floor(amountValue * 10);
            if (!user) {
                res.status(400).json('User not found');
            }
            if (!user.balance) {
                user.balance = 0;
            }
            user.TransactionIdPeding = '';
            user.balance += creditsToAdd;
            await user.save();
            
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/profile`);
            // return res.status(201).json({ success: true, message: 'Transaction successful' });
        } else if (status === 'Declined') {

            if (!user) {
                res.status(400).json('User not found');
            }
                user.TransactionIdPeding = '';
                await user.save();
            // return res.status(201).json({ success: false, message: 'Transaction delete' });
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/`);
        } else {
            // return res.status(401).json({ error: 'No transaction ID found' });
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/`);
        }
    } catch (error) {
        console.error(error);
        res.status(400).json("Error service down")
    }
}

async function createDeal(req, res) {
    try {

        // TODO need to recalculate sum of items




        const { items, sum } = req.body;

        const userId = req.user._id

        const user = await Steam.findById(userId)
        console.log(user)
        if (user.balance < sum) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }
;
        const TradeLink = user.TradeLink;

        if (!TradeLink){
            return res.status(500).json('Need to add trade offer link');
        }

        // TODO free bot from db! for all actions above

        const customDataDirectory = './my-steam-data';

        // BOT action
        const client = new SteamUser({
            'dataDirectory': customDataDirectory
        });

        const community = new SteamCommunity();

        const manager = new TradeOfferManager({
            "steam": client,
            "community": community,
            "language": "en",
            "pollInterval": 10000,
            "cancelTime": 90000,
        });

        const username = 'mp8m8n65a9'
        const password = 'aa96w3vvRQAF'
        const shared_secret = 'NZATQ5zRMhZ1wlrsWRrp3ImmKR0='
        const identity_secret = 'g0hsncpUEmQyfSWX0OdEr7Jdrq4='

        const logInOptions = {
            accountName: `${username}`,
            password: `${password}`,
            twoFactorCode: SteamTotp.generateAuthCode(`${shared_secret}`)
        };

        client.logOn(logInOptions);


        client.on('error', async (err) => {
            console.log(err.message)
            console.log('err.message  on error')
        });

        client.on("loggedOn", async () => {
            client.setPersona(SteamUser.EPersonaState.Online, username);
            console.log(client)
            client.getPersonas([client.steamID], (personas) => {
                console.info("Logged as '" + "' (" + client.steamID + ")");

            })

        })

        client.on('webSession', (sid, cookies) => {
            manager.setCookies(cookies, async (err) => {
                if (err) {
                    console.error("An error occurred while setting cookies:" + err);
                    // this.userStatusGateway.sendEventToUser(user.id, 'tradeError', { status: 'error' })
                    return;
                }
                console.log("Websession created and cookies set");

                community.setCookies(cookies);
                community.startConfirmationChecker(10000, identity_secret);
                const tradeSendOffer = async () => {
                    // TRADE

                    let trade = manager.createOffer(TradeLink);
                    console.log('items items items items items items items items items items');
                    console.log(items);
                    console.log('items items items items items items items items items items');


                    trade.addMyItems(items);
                    trade.setMessage("hello)" );
                    console.log(trade)
                    user.balance -= sum;
                    await user.save();
                    trade.send(async (err, status) => {
                        if (err) {
                            console.log("Queued again. An error occurred while sending trade: " + err);
                            // this.userStatusGateway.sendEventToUser(user.id, 'tradeError', { status: 'error' })
                            return;
                        }

                        if (status == 'pending') {
                            // We need to confirm it
                            // console.log(`Offer   #${offer.id} sent, but requires confirmation`);
                            community.acceptConfirmationForObject(identity_secret, trade.id, function(err) {
                                if (err) {
                                    console.log(err);
                                    console.log('tyta')
                                } else {
                                    console.log("Offer confirmed");
                                }
                            });
                        } else {
                            console.log(`Offer #${trade.id} sent successfully`);
                        }
                    })
                }

                await tradeSendOffer()



                manager.on("receivedOfferChanged", async offer => {
                    console.warn("Incoming offer #" + offer.id + " changed state to: " + TradeOfferManager.ETradeOfferState[offer.state]);
                });

                manager.on("newOffer", async offer => {

                    console.debug("New incoming offer #" + offer.id + "! Cancelling...");

                });

            })
        })

    } catch (error) {
        console.error(error);
        res.status(400).json('Failed to check payment status');
    }
}



module.exports = {
    handleTransactionAndBalance,
    checkPaymentStatus,
    createDeal
};
