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
Router.get('/profile/:mssv', (req, res) => {
   let mssv = req.params.mssv
   sinhvienModel.findOne({ mssv: mssv }, (err, sinhvien) => {
      if (err) {
         res.status(404).render('views/404.ejs')
      }
      else {
         res.json(sinhvien)
      }
   })
})


Router.post('/post', (req, res) => {
   let mssv = res.locals.user.mssv
   let content = req.body.content
   if (content != '') {
      let post = new postModel({
         owner: mssv,
         content: content
      })
      post.save()
      res.status(200).send(`MSSV: ${mssv} \nContent: ${content}`)
   }
   else {
      res.status(401).send(`Vui lòng nhập nội dung`)
   }
})
Router.get('/post', (req, res) => {
   res.render('views/post')
})
Router.get('/posts/:pageIndex', (req, res) => {
   let pageIndex = parseInt(req.params.pageIndex)
   postModel.countDocuments({})
      .then(postsCount => {
         if (postsCount - pageIndex * 10 >= 10) {
            postModel.find({}).sort({ date: -1 }).limit(10).skip(pageIndex * 10).exec((err, posts) => {
               if (err) {
                  res.send(err)
               }
               else {
                  res.json(posts)
               }
            })
         }
         else if (postsCount - pageIndex * 10 > 0) {
            postModel.find({}).sort({ date: -1 }).limit(postsCount - pageIndex * 10).skip(pageIndex*10).exec((err, posts) => {
               if (err) {
                  res.send(err)
               }
               else {
                  res.json(posts)
               }
            })
         }
         else {
            res.send('End')
         }
      })
      .catch(err => {
         res.send(err)
      })


})

module.exports = Router