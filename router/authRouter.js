const express = require('express')
const passport = require('passport')
const Router = express.Router()
const jwt = require('jsonwebtoken')

const sinhvienModel = require('../models/Sinhvien.model')

Router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
Router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    let user = req.user
    let mssv = String(user.emails[0].value).split("@")[0]
    let validator = String(user.emails[0].value).split("@")[1]
    if (validator == "student.tdtu.edu.vn") {
        let userDoc = new sinhvienModel({
            id: user.id,
            email: user.emails[0].value,
            fullname: user.displayName,
            avatar: user.photos[0].value,
            mssv: mssv
        })
        let isExitsts = await sinhvienModel.exists({mssv:mssv})
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
                res.locals.user = userDoc
                if (err) throw err;
                res.cookie('jwt', token)
                if (isExitsts){
                    res.redirect('/')
                }
                else{
                    userDoc.save().then(()=>{
                        res.redirect(`/profile/${mssv}/edit`)
                    })
                }
            }
        );
    }
    else {
        res.redirect("/login")
    }
})

module.exports = Router