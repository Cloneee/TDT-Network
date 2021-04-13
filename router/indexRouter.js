const express = require('express')
const Router = express.Router()
const { requireAuth, isLogged } = require('../middleware/authMiddleware')

Router.get('/', requireAuth, (req,res)=>{
   res.render('views/index')
})
Router.get('/login', isLogged, (req,res)=>{
   res.render('views/sv-login')
})
Router.get('/logout', (req,res)=>{
   res.cookie('jwt','',{expires: new Date(0)}).redirect('/login')
})
module.exports = Router