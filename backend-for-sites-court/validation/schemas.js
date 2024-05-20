const joi = require('joi');

const DATE_REG = /([0-9]{2})-([0-9]{2})-([0-9]{4})/i;
const TIME_REG = /([0-9]{2}):([0-9]{2})/i;

const RegisterSchema = joi.object().keys({
    Country: joi.string().required().messages({
        'any.required': "Country is required",
        'string.empty': 'Country is required'
    }),
    FirstName: joi.string().min(3).required().messages({
        'string.min': 'Firstname must be at least 3 characters',
        'any.required': 'Firstname is required',
        'string.empty': 'Firstname is required'
    }),
    LastName: joi.string().max(25).required().messages({
        'string.max': 'Lastname must not exceed 25 characters',
        'any.required': 'Lastname is required',
        'string.empty': 'Lastname is required'
    }),
    email: joi.string().required().lowercase().messages({
        'any.required': "Email is required",
        'string.empty': 'Email is required'
    }),
    password: joi.string().min(6).max(30).required().messages({
        'any.required': 'Password must be 6-30 symbols',
        'string.empty': 'Password must be 6-30 symbols'
    })
});

const LoginSchema = joi.object().keys({
    email: joi.string().required().messages({
        'any.required': "Email is required",
        'string.empty': 'Email is required'
    }),
    password: joi.string().min(6).max(30).required().messages({
        'any.required': "Password is required",
        'string.empty': 'Password is required'
    }),
});


const UserSchema = joi.object().keys({
    _id: joi.string(),
    email: joi.string().min(1).messages({ 'string.empty': 'Required' }),
    password: joi.string().min(6).max(30).messages({ 'string.empty': 'Required' }),
});





module.exports = {
    RegisterSchema,
    LoginSchema,
    UserSchema,
};
