const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateRegisterInput(data) {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';
    //data.username = !isEmpty(data.username) ? data.username : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (Validator.isEmpty(data.email)) {
        errors.email = "Email required";
    }

    /*if (Validator.isEmpty(data.username)) {
        errors.username = 'Username обов’язкове поле';
    }*/

    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password required';
    }

    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Password must be 6-30 symbols';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
