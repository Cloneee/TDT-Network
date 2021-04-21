const express = require('express')
const Router = express.Router()

const { validationResult } = require('express-validator')
const accountModel = require('../models/Account.model')
const loginValidator = require('./validators/loginValidator')
const registerValidator = require("./validators/registerValidator");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { requireAdminAuth, checkAdmin, isLogged } = require('../middleware/authMiddleware')

Router.get('*', checkAdmin)

Router.get('/', requireAdminAuth, (req, res) => {
  res.render('views/admin-panel.ejs');
})

Router.get('/login', isLogged, (req, res) => {
  res.render('views/admin-login')
})

Router.post("/login", loginValidator, (req, res) => {
  let result = validationResult(req);
  if (result.errors.length === 0) {
    let { username, password } = req.body;
    accountModel.findOne({ username: username }, (err, user) => {
      if (err) res.status(400).json({ message: err });
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
                expiresIn: "1h",
              },
              (err, token) => {
                if (err) throw err;
                res.cookie('jwt', token, { maxAge: 900000, httpOnly: true })
                  .redirect('/admin')
              }
            );
          } else {
            return res.status(401).json({
              code: 2,
              message: "Mật khẩu không trùng khớp",
            });
          }
        });
      } else {
        return res.status(401).json({
          code: 2,
          message: "Không tìm thấy người dùng",
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
    return res.status(401).json({
      code: 1,
      message: message,
    });
  }
});


Router.get('/register',requireAdminAuth, (req,res)=>{
  res.render('views/register')
})
Router.post("/register", registerValidator, (req, res) => {
  console.log(req.body.faculty)
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
            });
            return user.save();
          })
          .then(() => {
            return res.status(201).json({
              code: 0,
              message: "Đăng ký thành công",
            });
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
});

module.exports = Router