const mongoose = require('mongoose');

const User = require('../models/UserSchema');

const DB_CONN = process.env.DB_CONN;

mongoose.set('strictQuery', false);
mongoose.connect(DB_CONN, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

class DBMethods {
    constructor (model) {
        this.Model = model;
    }

    async create (data) {
        try {
            return await this.Model.create(data);
        } catch (error) {
            console.log('[create]', error);

            return null;
        }
    }

    async get (req) {
        try {
            return await this.Model.findOne(req);
        } catch (error) {
            console.log('[get]', error);

            return null;
        }
    }

    async getAll (req, score = {}, sort = {}, limit = false, fieldsToSelect = {}) {
        try {
            return (limit) ?
                await this.Model.find(req, fieldsToSelect, score).sort(sort).limit(limit) :
                await this.Model.find(req);
        } catch (error) {
            console.log('[getAll]', error);

            return null;
        }
    }

    async update (req, update, returnDocument = 'before', upsert = false) {
        try {
            return await this.Model.findOneAndUpdate(req, update, {
                upsert,
                returnDocument
            }).lean();
        } catch (error) {
            console.log('[update]', error);

            return null;
        }
    }

    async updateAll (req, update) {
        try {
            return await this.Model.updateMany(req, update);
        } catch (error) {
            console.log('[updateAll]', error);

            return null;
        }
    }

    async delete (req) {
        try {
            return await this.Model.findOneAndDelete(req);
        } catch (error) {
            console.log('[delete]', error);

            return null;
        }
    }

    async deleteAll (req) {
        try {
            return await this.Model.deleteMany(req);
        } catch (error) {
            console.log('[deleteAll]', error);

            return null;
        }
    }

    async getCount () {
        return await this.Model.find().count();
    }

    async dropCollection () {
        return await this.Model.collection.drop();
    }
}

const userService = new DBMethods(User);

module.exports = {
    userService,

}
