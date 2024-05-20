const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const { userService } = require('../services/db');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.DB_SECRET;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            const user = await userService.get({ _id: jwt_payload.id });

            if (user) {
                return done(null, user);
            } else {
                return done(null, null);
            }
        })
    );
};
