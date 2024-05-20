const express = require('express');
const router = express.Router();
const middlewares = require('../middlewares/server');
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

router.use(bodyParser.json());


export default esimRouter