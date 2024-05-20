const jwt = require('jsonwebtoken');

const User = require('../models/UserSchema');

const {
    RegisterSchema,
    LoginSchema,

} = require('../validation/schemas');

const SECRET = process.env.DB_SECRET;

const getModel = (key) => {
    let Model = null;

    switch (key) {
        case '/register':
            Model = User;
            break;
        case 'user':
            Model = User;
            break

    }

    return Model;
};

const getSchema = (key) => {
    let Schema = null;

    switch (key) {
        case '/register':
            Schema = RegisterSchema;
            break;
        case '/login':
            Schema = LoginSchema;
            break;
    }

    return Schema;
};

const checkAuth = (req, res, next) => {
    const {
        headers
    } = req;
    const authorization = headers.authorization || null;

    try {
        const decode = jwt.verify(authorization.replace('Bearer ', ''), SECRET);

        User.findOne({ email: decode.email }).then((data) => {
            if (data) {
                req.user = data;

                return next();
            } else {
                return res.status(400).json({ message: 'No user' });
            }
        });
    } catch (error) {
        return res.status(400).json(error);
    }
};

const checkBody = (req, res, next) => {
    const {
        params,
        body,
        route,
        user
    } = req;
    const key = (params.key) ? params.key : route.path;
    const Schema = getSchema(key);

    if (!Schema) {
        return res.status(400);
    }

    const { error } = Schema.validate(body);

    let response = null;

    if (error) {
        const errors = error.details.reduce((acc, el) => {
            acc[el.context.key] = el.message;

            return acc;
        }, {});

        return res.status(400).json(errors);
    }

    if (route.path === '/register' || key === 'user') {
        let dbResponse = null,
            dbRequest = (body && body.id && body.email) ? 
                {
                    _id: {
                        $ne: body.id,
                    },
                    $or: [
                        { email: body.email }
                    ]
                } : (body && body.email) ? 
                    {
                        email: body.email
                    } : null;
        if (dbRequest) {
            return User.findOne(dbRequest).then((data) => {
                if (data) {
                    dbResponse = {};
    
                    if (data.email === body.email) {
                        dbResponse.email = 'Email not correct';
                    }
    
                    return res.status(400).json(dbResponse);
                } else {
                    return next();
                }
            });
        }
    }
    if (response) {
        return res.status(400).json(response);
    } else {    
        return next();
    }
};
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect(302, `${process.env.FRONTEND_URL}/`);
}




module.exports = {
    getModel,
    checkAuth,
    checkBody,
    getSchema,
    ensureAuthenticated
};

