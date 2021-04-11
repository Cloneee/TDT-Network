const express = require('express')
const Router = express.Router()

Router.get('/', (req,res)=>{
   res.render('views/index')
})
module.exports = Router