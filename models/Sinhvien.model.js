const mongoose = require('mongoose')

const SinhvienShcema = mongoose.Schema({
    id:{
        type: String,
        required: true
    },
    mssv: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    fullname:{
        type: String,
        required: true
    },
    avatar:{
        type: String,
        default: null
    }
})

module.exports = mongoose.model('Sinhvien', SinhvienShcema)