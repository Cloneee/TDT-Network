const express = require('express')
const passport = require('passport')
const Router = express.Router()
const jwt = require('jsonwebtoken')

const sinhvientModel = require('../models/Sinhvien.model')

Router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
Router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    let user = req.user
    let mssv = String(user.emails[0].value).split("@")[0]
    let validator = String(user.emails[0].value).split("@")[1]
    if (validator == "student.tdtu.edu.vn") {
        let userDoc = new sinhvientModel({
            id: user.id,
            email: user.emails[0].value,
            fullname: user.displayName,
            avatar: user.photos[0].value,
            mssv: mssv
        })
        sinhvientModel.findOneAndUpdate(
            { mssv: mssv }, // find a document with that filter
            userDoc, // document to insert when nothing was found
            { upsert: true, new: true, runValidators: true }, // options
            function (err, doc) { // callback
                if (err) {
                } else {
                    return
                }
            }
        );
        jwt.sign( //Gửi JWT về client
            {
                mssv: mssv,
                fullname: user.displayName,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h",
            },
            (err, token) => {
                if (err) throw err;
                res.cookie('jwt', token, { maxAge: 900000, httpOnly: true })
                    .redirect('/')
            }
        );
    }
    else {
        res.send("You are not a tdt student")
    }
})

module.exports = Router