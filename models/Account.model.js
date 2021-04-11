const mongoose = require('mongoose')

const AccountSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    fullname:{
        type: String,
        default: "Người dùng mới",
        required: true
    },
    avatar:{
        type: String,
        default: null
    },
    role: {
        admin: Boolean,
        mod: Boolean
    }
})

module.exports = mongoose.model('Account', AccountSchema)