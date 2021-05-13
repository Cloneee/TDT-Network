const express = require('express')
const Router = express.Router()
const { requireAuth, isLogged } = require('../middleware/authMiddleware')
const { upload } = require('../middleware/upload')
const postModel = require('../models/Post.model')
const sinhvienModel = require('../models/Sinhvien.model')
const facultyModel = require('../models/Faculty.model')
const fs = require('fs')
const notiModel = require('../models/Notification.model')

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
         if (sinhvien == null){
            res.redirect('/404')
         }
         res.locals.sinhvien = sinhvien
         res.render('views/wall-profile')
      }
   })
})
Router.get('/profile/:mssv/edit', async (req,res)=>{
   let mssv = req.params.mssv
   if (res.locals.user.mssv == mssv){
      let faculties = await facultyModel.find({name: { $regex: 'Khoa' }, id: {$ne: 'TTTPKHQLUDCN'}})
      res.locals.faculties = faculties
      res.render('views/edit-profile-sv.ejs')
   }
   else{
       res.redirect(`/profile/${mssv}`)
   }
})
Router.post('/profile/:mssv/edit', upload.single('image'), async (req,res)=>{
   let mssv = req.params.mssv
   let updateData = req.body
   let user = await sinhvienModel.findOne({mssv: mssv})
   if (req.file != undefined){
      updateData.avatar = req.file.path
      fs.unlink(user.avatar, (err) => {
         if (err) {
           console.error(err)
           return
         }
       
         //file removed
       })
   }
   sinhvienModel.findOneAndUpdate({mssv: mssv}, updateData, {new: true, upsert:true}, (err,doc)=>{
      if (err){
         console.log('err')
         res.send(err)
      }
      else{
         res.redirect(`/profile/${mssv}/edit`)
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
Router.get('/posts/:pageIndex', (req, res) => {//Load post on newsfeed
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
Router.get('/posts/:pageIndex/:mssv', (req, res) => { //load posts on wall
   let mssv = req.params.mssv
   let pageIndex = parseInt(req.params.pageIndex)
   postModel.countDocuments({"owner.mssv":mssv})
      .then(postsCount => {
         if (postsCount - pageIndex * 10 >= 10) {
            postModel.find({"owner.mssv":mssv}).sort({ date: -1 }).limit(10).skip(pageIndex * 10).exec((err, posts) => {
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
            postModel.find({"owner.mssv":mssv}).sort({ date: -1 }).limit(postsCount - pageIndex * 10).skip(pageIndex * 10).exec((err, posts) => {
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
Router.get('/noti', async (req,res)=>{
   let faculties = await facultyModel.find()
   let faculty = req.query.faculty
   let pageIndex = req.query.page || 0
   let postsCount, totalPages, noties, facultyPostCount
   postsCount = await notiModel.countDocuments({})
   if(!faculty){
      if (postsCount - pageIndex * 10 >= 10) {
         noties = await notiModel.find({}).sort({ date: -1 }).limit(10).skip(pageIndex * 10)
      }
      else if (postsCount - pageIndex * 10 > 0) {
         noties = await notiModel.find({}).sort({ date: -1 }).limit(postsCount - pageIndex * 10).skip(pageIndex * 10)
      }
      if (postsCount<=10){
         totalPages = 1
      } else {
         totalPages = Math.floor(postsCount/10)+1
      }
   } else{
      if (postsCount - pageIndex * 10 >= 10) {
         noties = await notiModel.find({faculty: faculty}).sort({ date: -1 }).limit(10).skip(pageIndex * 10)
      }
      else if (postsCount - pageIndex * 10 > 0) {
         noties = await notiModel.find({faculty: faculty}).sort({ date: -1 }).limit(postsCount - pageIndex * 10).skip(pageIndex * 10)
      }
      facultyPostCount = await notiModel.countDocuments({faculty: faculty})
      if (facultyPostCount<=10){
         totalPages = 1
      } else {
         totalPages = Math.floor(facultyPostCount/10)+1
      }
   }
   res.render('views/notification-board', {faculties: faculties, selectFaculty: faculty, noties: noties, page: pageIndex, totalPages: totalPages})
})
Router.get('/noti/:id', (req,res)=>{
   let id = req.params.id
   notiModel.findById(id, (err,noti)=>{
      facultyModel.findOne({id: noti.faculty}, (err,faculty)=>{
         res.render('views/noti-detail', {noti: noti, faculty: faculty})
      })
   })
})
Router.get('/mainpage-noti', async (req,res)=>{
   let noti = await notiModel.find({}).sort({ date: -1 }).limit(8)
   res.json(noti)
})
module.exports = Router