const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const { requireAuth, checkUser } = require('./middleware/authMiddleware')

require('dotenv/config')
require('./passport-setup')


const adminRouter = require('./router/adminRouter')
const authRouter = require('./router/authRouter')
const indexRouter = require('./router/indexRouter')

//Setup database
mongoose.Promise = global.Promise
mongoose.set('useFindAndModify', false);
const db = mongoose.connection
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
//End DB Section

const port = process.env.PORT || 8080

app.set('view engine', 'ejs')
app.set('views', __dirname)
app.use('/public', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(cookieParser());

app.use('*', checkUser)

app.use('/', indexRouter)
app.use('/admin', adminRouter)
app.use('/auth', authRouter)

app.use((req,res)=>{
    res.status(404).render('views/404.ejs')
})

app.listen(port, () => {
    console.log('Listening on http://localhost:' + port)
})
