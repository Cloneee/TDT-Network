const express = require('express')
const Router = express.Router()
const { requireAuth, isLogged } = require('../middleware/authMiddleware')
const postModel = require('../models/Post.model')
const sinhvienModel = require('../models/Sinhvien.model')

Router.get('/', requireAuth, (req, res) => {
   res.render('views/index')
})
Router.get('/login', isLogged, (req, res) => {
   res.render('views/sv-login')
})
Router.get('/logout', (req, res) => {
   res.cookie('jwt', '', { expires: new Date(0) }).redirect('/login')
})
Router.post('/post', (req, res) => {
   let mssv = res.locals.user.mssv
   let content = req.body.content
   let post = new postModel({
      owner: mssv,
      content: content
   })
   post.save()
   res.redirect('/post');
})
Router.get('/profile/:mssv',(req,res)=>{
   let mssv = req.params.mssv
   sinhvienModel.findOne({mssv: mssv}, (err,sinhvien)=>{
      if (err){
         res.status(404).render('views/404.ejs')
      }
      else{
         res.json(sinhvien)
      }
   })
})
Router.get('/post', (req, res) => {
   res.render('views/post')
})
Router.get('/posts', (req,res)=>{
   let limit = parseInt(req.query.limit)
   postModel.find({}).sort({date: -1}).limit(limit).exec((err,posts)=>{
      if (err){
         res.send(err)
      }
      else{
         res.json(posts)
      }
   })
})

module.exports = Router