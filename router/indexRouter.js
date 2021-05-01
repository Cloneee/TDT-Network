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
                  posts.unshift(res.locals.user.mssv)
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
                  posts.unshift(res.locals.user.mssv)
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
Router.post('/post',upload.single('image'), (req, res) => {
   let mssv = res.locals.user.mssv
   let content = req.body.content
   let fullname = res.locals.user.fullname
   let type = req.body.type

   if (content != '') {
      let post = new postModel({
         owner: {
            fullname: fullname,
            mssv: mssv
         },
         content: content
      })
      switch (type) {
         case 'img':
            post.set({ image: req.file.path })
            break
         case 'video':
            post.set({ video: req.body.video })
            break
         default:
      }
      post.save()
      res.status(200).json(post)
   }
   else {
      res.status(400).send(`Please enter your caption`)
   }
})

Router.delete('/post/:id', (req, res) => {
   let id = req.params.id
   postModel.findById(id).exec((err, post) => {
      if (err) {
         res.status(404).send("Can't find post")
      }
      else if (res.locals.user.mssv == post.owner.mssv) {
         postModel.findByIdAndDelete(id, (err, result) => {
            if (err) {
               res.status(404).send("Can't find post")
            }
            else {
               if (result.image) {
                  fs.unlink(result.image, (err) => {
                     if (err) {
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
      else if (res.locals.user.mssv == post.owner.mssv) {
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