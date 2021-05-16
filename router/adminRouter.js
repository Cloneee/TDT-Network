const express = require('express')
const Router = express.Router()

const { validationResult } = require('express-validator')
const { upload } = require('../middleware/upload')
const accountModel = require('../models/Account.model')
const notiModel = require('../models/Notification.model')
const facultyModel = require('../models/Faculty.model')
const loginValidator = require('./validators/loginValidator')
const registerValidator = require("./validators/registerValidator");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')

const { requireAdminAuth, isLogged } = require('../middleware/authMiddleware')
Router.get('/',requireAdminAuth, async (req, res) => {
  let faculties = await facultyModel.find().where('id').in(res.locals.admin.faculty)
  res.locals.faculties = faculties
  res.render('views/admin-panel.ejs');
})
Router.post('/', async (req,res)=>{
  let noti = new notiModel(req.body)
  noti.owner = res.locals.admin.username
  noti.save()
  let faculties = await facultyModel.find().where('id').in(res.locals.admin.faculty)
  res.locals.faculties = faculties
  res.render('views/admin-panel', {msg: 'Success'})
})
Router.get('/login', isLogged, (req, res) => {
  res.render('views/admin-login')
})
Router.post('/login', loginValidator, (req, res) => {
  let result = validationResult(req);
  if (result.errors.length === 0) {
    let { username, password } = req.body;
    accountModel.findOne({ username: username }, (err, user) => {
      if (err){
        console.log(err)
      }
      if (user) {
        bcrypt.compare(password, user.password, (err, isMatched) => {
          if (err) {
            return res.status(400).json({ err });
          }
          if (isMatched) {
            jwt.sign( //Gửi JWT về client
              {
                username: user.username,
                fullname: user.fullname,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "24h",
              },
              (err, token) => {
                if (err) throw err;
                res.cookie('jwt', token, { maxAge: 900000, httpOnly: true })
                if (user.new){
                  res.redirect(`profile/${user.username}/edit`)
                }
                else(
                  res.redirect('/') 
                )
              }
            );
          } else {
            return res.render('views/admin-login', {code: 2, msg: "Mật khẩu không trùng khớp"}) 
          }
        });
      } else {
        return  res.render('views/admin-login', {code: 2, msg: "Không tìm thấy người dùng"}) 
      }
    });
  } else {
    let messages = result.mapped();
    let message = "";
    for (m in messages) {
      message = messages[m].msg;
      break;
    }
    return res.status(401).json({
      code: 1,
      message: message,
    });
  }
});
Router.get('/register',requireAdminAuth, (req,res)=>{
  res.render('views/register')
})
Router.post('/register', registerValidator, (req, res) => {
  let result = validationResult(req);
  if (result.errors.length === 0) {
    let { username, password, email, fullname, avatar, role, faculty } = req.body;
    accountModel.findOne({ username: username }, (err, isDup) => {
      if (err) res.status(400).json({ message: err });
      if (isDup)
        res.status(400).json({
          code: 2,
          message: "Tên này đã được sử dụng",
        });
      else {
        bcrypt
          .hash(password, 10)
          .then((hashed) => {
            let user = new accountModel({
              username: username,
              password: hashed,
              email: email,
              fullname: fullname,
              avatar: avatar,
              roll: role,
              faculty: faculty
            })
            return user.save();
          })
          .then(() => {
            return res.redirect('/admin/register');
          });
      }
    });
  } else {
    let messages = result.mapped();
    let message = "";
    for (m in messages) {
      message = messages[m].msg;
      break;
    }
    return res.status(400).json({
      code: 1,
      message: message,
    });
  }
})
Router.get('/profile/:username/edit', (req,res)=>{
  res.render('views/edit-profile-admin')
})
Router.post('/profile/:username/edit',upload.single('image'), (req,res)=>{
  let username = req.params.username
  let updateData = req.body
  if(req.file!=undefined){
    updateData.avatar = req.file.path
  }
  updateData.new = false
  accountModel.findOneAndUpdate({username: username}, updateData, {new: true}, (err,doc)=>{
    if (err){
      console.log(err)
    }
     res.redirect(`/admin/profile/${username}/edit`);
  })
})
Router.get('/profile/:username/password', (req,res)=>{
  res.render('views/change-password-admin')
})
Router.post('/profile/:username/password', async (req,res)=>{
  let username = req.params.username
  let oPass = req.body.password
  let nPass = req.body.newPassword
  let user = await accountModel.findOne({username: username})
  bcrypt.compare(oPass, user.password, (err, isMatched)=>{
    if (err) {
      console.log(err)
    }
    else if (isMatched){
      bcrypt.hash(nPass, 10, (err,hash)=>{
        if (err){
          console.log(err)
        }
        else{
          user.password = hash
          user.save()
          res.render('views/change-password-admin', {msg: 'Success change password', code: 0})
        }
      })
    }
    else{
      res.render('views/change-password-admin', {msg: 'Wrong Password', code:1})
    }
  })
})
Router.put('/noti/:id',async (req,res)=>{
  let updated = req.body
  noti = await notiModel.findById(req.params.id)
  if (res.locals.admin.username == noti.owner){
    noti.title = updated.title
    noti.content = updated.content
    noti.save()
    res.send('ok')
  } else{
    res.send('Not have permission')
  }
})
Router.delete('/noti/:id', async (req,res)=>{
  noti = await notiModel.findById(req.params.id)
  if (res.locals.admin.username == noti.owner){
    notiModel.deleteOne({_id: req.params.id}).then(res.send('deleted'))
  } else{
    res.send('Not have permission')
  }
})
module.exports = Router