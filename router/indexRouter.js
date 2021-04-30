const express = require('express')
const Router = express.Router()
const { requireAuth, isLogged } = require('../middleware/authMiddleware')
const { upload } = require('../middleware/upload')
const postModel = require('../models/Post.model')
const sinhvienModel = require('../models/Sinhvien.model')
const fs = require('fs')

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
         res.locals.sinhvien = sinhvien
         res.render('views/wall-profile')
      }
   })
})
Router.get('/profile/:mssv/posts', (req, res) => {
   let mssv = req.params.mssv
   postModel.find({ owner: mssv }).sort({ date: -1 }).exec((err, posts) => {
      if (err) {
         res.status(404).send(err)
      }
      else {
         res.json(posts)
      }
   })
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
            postModel.find({}).sort({ date: -1 }).limit(postsCount - pageIndex * 10).skip(pageIndex * 10).exec((err, posts) => {
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
Router.post('/post', (req, res) => {
   let mssv = res.locals.user.mssv
   let content = req.body.content
   let video = req.body.video
   
   if (content != '') {
      let post = new postModel({
         owner: mssv,
         content: content
      })
      post.save()
      res.status(200).send(`MSSV: ${mssv} \nContent: ${content}`)
   }
   else {
      res.status(400).send(`Vui lòng nhập nội dung`)
   }
})
Router.post('/postimage', upload.single('image'), (req, res) => {
   let mssv = res.locals.user.mssv
   let content = req.body.content
   if (content != '') {
      let post = new postModel({
         owner: mssv,
         content: content,
         image: req.file.path
      })
      post.save()
      res.status(200).send(`MSSV: ${mssv} \nContent: ${content}`)
   }
   else {
      res.status(401).send(`Vui lòng nhập nội dung`)
   }
})
Router.post('/postvideo', (req, res) => {
   let mssv = res.locals.user.mssv
   let content = req.body.content
   let video = req.body.video
   if (content != '') {
      let post = new postModel({
         owner: mssv,
         content: content,
         video: video
      })
      post.save()
      res.status(200).send(`MSSV: ${mssv} \nContent: ${content}`)
   }
   else {
      res.status(401).send(`Vui lòng nhập nội dung`)
   }
})
Router.delete('/post/:id', (req, res) => {
   let id = req.params.id
   postModel.findById(id).exec((err, post) => {
      if (err) {
         res.status(404).send("Can't find post")
      }
      else if (res.locals.user.mssv == post.owner) {
         postModel.findByIdAndDelete(id, (err, result) => {
            if (err) {
               res.status(404).send("Can't find post")
            }
            else {
               if(result.image){
                  fs.unlink(result.image, (err)=>{
                     if (err){
                        console.log(err)
                        return
                     }
                  })
               }
               res.status(200).send('Delete post with id: ' + id)
            }
         })
      }
      else {
         res.status(403).send("You don't have permission")
      }
   })
})
Router.put('/post/:id', (req, res) => {
   let id = req.params.id
   let contentUpdated = req.body.content
   postModel.findById(id).exec((err, post) => {
      if (err) {
         res.status(404).send("Can't find post")
      }
      else if (res.locals.user.mssv == post.owner) {
         postModel.findByIdAndUpdate(id, { content: contentUpdated }, (err, result) => {
            if (err) {
               res.status(404).send("Can't find post")
            }
            else {
               res.status(200).send('Update post with id: ' + id)
            }
         })
      }
      else {
         res.status(403).send("You don't have permission")
      }
   })
})

module.exports = Router