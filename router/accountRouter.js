const express = require('express')
const Router = express.Router()

const {validatorResult} = require('express-validator')
const accountModel = require('../models/Account.model')
const loginValidator = require('./validators/loginValidator')
const bcrypt = require('bcrypt')

Router.get('/login', (req,res)=>{
    res.render('views/sv-login')
})

module.exports = Router