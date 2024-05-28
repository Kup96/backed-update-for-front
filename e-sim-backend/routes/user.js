const express = require('express');
const router = express.Router();
const middlewares = require('../middlewares/server');
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const {profile, catalogs,getProducts, getProductById,getProductLanding, buyCards} = require('../controller/user.controller')


router.use(bodyParser.json());

router.get('/profile', profile)
router.get('/catalog', catalogs)
router.get('/products', getProducts)// GIFT CARDS
router.get('/products/:producId', getProductById) // GIFT CARDS
router.post('/buyCards', buyCards)
// router.get('/productsAll', getProductLanding)
module.exports = router;