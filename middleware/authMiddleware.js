const jwt = require('jsonwebtoken')
const sinhvientModel = require('../models/Sinhvien.model')
const accountModel = require('../models/Account.model')

const requireAuth = (req,res,next) =>{
    const token = req.cookies.jwt
    if (token){
        jwt.verify(token, process.env.JWT_SECRET, (err,decodedToken)=>{
            if (err){
                console.log(err)
                res.redirect('/login')
            }
            else{
                if (decodedToken.mssv){
                    return next()
                }
                else {
                    res.redirect('/login')
                }
            }
        })
    }
    else{
         res.redirect('/login')
    }
}

const requireAdminAuth = (req,res,next) =>{
    const token = req.cookies.jwt
    if (token){
        jwt.verify(token, process.env.JWT_SECRET, (err,decodedToken)=>{
            if (err){
                console.log(err)
                 res.redirect('/admin/login')
            }
            else{
                if (decodedToken.username){
                    return next()
                }
                else {
                    res.redirect('/admin/login')
                }
            }
        })
    }
    else{
         res.redirect('/admin/login')
    }
}

const checkUser =  (req,res,next) =>{
    const token = req.cookies.jwt
    if (token){
        jwt.verify(token, process.env.JWT_SECRET, async (err,decodedToken)=>{
            if (err){
                res.locals.user = null
                next()
            }
            else{
                let user = await sinhvientModel.findOne({mssv: decodedToken.mssv})
                res.locals.user = user
                next()
            }
        })
    }
    else{
        res.locals.user = null
        next()
    }
}

const checkAdmin = (req,res,next) =>{
    const token = req.cookies.jwt
    if (token){
        jwt.verify(token, process.env.JWT_SECRET, async (err,decodedToken)=>{
            if (err){
                res.locals.admin = null
                next()
            }
            else{
                let admin = await accountModel.findOne({username: decodedToken.username})
                res.locals.admin = admin
                next()
            }
        })
    }
    else{
        res.locals.admin = null
        next()
    }
}

const isLogged = (req,res,next) =>{
    const token = req.cookies.jwt
    if (token){
        jwt.verify(token, process.env.JWT_SECRET, async (err,decodedToken)=>{
            if (err){
                next()
            }
            else{
                //Check user or admin
                if (decodedToken.mssv){
                    return res.redirect('/')
                }
                else{
                    return res.redirect('/admin')
                }
            }
        })
    }
    else{
        next()
    }
}

module.exports = { requireAuth, checkUser, requireAdminAuth, checkAdmin, isLogged }