const express = require('express');
const session = require('express-session');
const {ensureAuthenticated} = require('../middlewares/server')
const {handleTransactionAndBalance, checkPaymentStatus, createDeal} = require('../controller/payments.steam.controller')
const SteamStrategy = require('passport-steam').Strategy;
const passport = require('passport');
const Steam = require('../models/SteamUserSchema');
const Bot = require('../models/SteamBotsSchema');
const bodyParser = require("body-parser");
const axios = require("axios");
const router = express.Router();
const _ = require("lodash")

router.use(session({
    secret: '1a2b3c4d5e6f7gsdfsdf8h9i0j',
    resave: true,
    saveUninitialized: true
}));

router.use(bodyParser.json());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new SteamStrategy({
    returnURL: `${process.env.BACKEND_URL}/login/auth/steam/return`,
    realm: `${process.env.BACKEND_URL}`,
    apiKey: '4E99C9AC12C928BA17E886D41863E9EB'
}, (identifier, profile, done) => {
    process.nextTick(() => {

        profile.identifier = identifier;


        Steam.findOne({ steamId: profile.id })
        .then(user => {
            if (!user) {
                const newUser = new Steam({
                    steamId: profile.id,
                    username: profile.displayName,
                    profileurl: profile._json.profileurl
                });
                newUser.save()
                    .then(savedUser => {
                        console.log('User saved successfully:', savedUser);
                        done(null, savedUser);
                    })
                    .catch(error => {
                        console.error('Error saving user:', error);
                        done(error);
                    });
            } else {
                console.log('User already exists:', user);
                done(null, user);
            }
        })
        .catch(error => {
            console.error('Error finding user:', error);
            done(error);
        });
    });
}));

router.use(passport.initialize());
router.use(passport.session());

router.get('/profile', ensureAuthenticated, async (req, res) => {
    const userId = req.user._id
    const updatedUser = await Steam.findById(userId);
    res.json(updatedUser);
});
router.get('/auth/steam',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        return res.redirect('/');
    }
);

router.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect(302, `${process.env.FRONTEND_URL}/profile`);
    }
);

router.post('/addTradelink', ensureAuthenticated, async(req,res) =>{
    try{
        const { tradeLink }  = req.body // TODO need to add check on trade link for this user by id32 in future
        const userId = req.user._id
        const user = await Steam.findById(userId)
        user.TradeLink = tradeLink
        await user.save()
        res.status(200).json('Trade link add in your profile!')
    }catch (error) {
        console.log(error)
        res.status(401).json({error: "Error server"})
    }
})

router.get('/check-user', ensureAuthenticated, async(req,res) =>{
    const {user} = req;

    if (user){
        return res.status(200).json('its okay')
    }

    res.status(401).json({ error: 'Not Auth' });
})

router.get('/logout', async (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Error logging out');
        }

        res.status(200).send('Logout successful');

    });
});
router.post('/create-transaction',ensureAuthenticated, async (req, res) => {
    try {
        console.log(req.body)
        console.log('req.body')
        const requestData = req.body;
        console.log('requestData')
        console.log(requestData)
        const result = await handleTransactionAndBalance(requestData, req, res);
        return res.json(result);
    } catch (error) {
        console.error('error ====================');
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/check-payments',checkPaymentStatus)

router.post('/tradeOffer',ensureAuthenticated, createDeal)

router.get('/checkBotItems', async (req, res) => {
    try {

        console.log('req.body')


        const config = {
            headers: {
                Cookie:
                    "timezoneOffset=10800,0; " +
                    "browserid=2745561354005608283; strInventoryLastContext=570_2; " +
                    "sessionid=87263b52996d2009f0886506; " +
                    "steamDidLoginRefresh=1690136418; " +
                    "steamCountry=UA%7C9c2616d1be6b5ddda1b27dfd5e676eaf; " +
                    "steamLoginSecure=76561198987489067%7C%7CeyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInI6MEQyM18yMzE4MTQ2OV8zQTVDNyIsICJzdWIiOiAiNzY1NjExOTg5ODc0ODkwNjciLCAiYXVkIjogWyAid2ViIiBdLCAiZXhwIjogMTY5Mzg0MjA1MSwgIm5iZiI6IDE2ODUxMTQ2MjYsICJpYXQiOiAxNjkzNzU0NjI2LCAianRpIjogIjBEMjFfMjMxODE0NjlfNEUyNzIiLCAib2F0IjogMTY5Mzc1NDYyNiwgInJ0X2V4cCI6IDE3MTIxMTQ5MDgsICJwZXIiOiAwLCAiaXBfc3ViamVjdCI6ICIxODguMTYzLjk2LjExNSIsICJpcF9jb25maXJtZXIiOiAiMTg4LjE2My45Ni4xMTUiIH0.zbwClwdJLw6y630WRVu0S3mUB4V1Fci-gNlu4wMmuL2CyXQ7Xh4aeaZjc4LIoEq7ZgHfZWZhpX4839f8OFRlBA"

            }
        }

        // const url = `http://steamcommunity.com/inventory/${id}/730/2?l=english&count=1000`
        const url = `http://steamcommunity.com/inventory/76561199446657917/730/2?l=english&count=1000`

        // TODO:
        const items = await axios.get(url, config)

        if (!items.data.descriptions){
            console.log('no items')
            return {inventory: [], count: 0, error: 'No items in your inventory for this game'}
        }

        for (const description of items.data.descriptions) {

            const matchingAsset = items.data.assets.find(asset => asset.classid === description.classid);

            if (matchingAsset) {
                description.assetid = matchingAsset.assetid;
                description.contextid = matchingAsset.contextid;
            }
        }

        const tradableItems = _.filter(items.data.descriptions,  function(o) {
            return (o.tradable === 1 && o.marketable === 1);
        });

        console.log('tradableItems')
        console.log(tradableItems)
        console.log('tradableItems data')

        const newArray = _.map(tradableItems, obj => {
            return {
                ...obj,
                price: _.random(1, 300),
                image: obj.icon_url,
            };
        });

        _.forEach(newArray, obj => _.omit(obj, [
            'appid',
            'classid',
            'currency',
            'background_color',
            'commodity',
            'actions',
            'market_actions',
            'market_tradable_restriction',
            'tags',
            'tradable',
            'type']));

        console.log(newArray)
        return res.status(200).json({inventory: newArray, count: newArray.length});

    } catch (error) {
        console.error('error ====================');
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
