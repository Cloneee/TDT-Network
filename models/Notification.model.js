const mongoose = require('mongoose')

const NotiSchema = mongoose.Schema({
    owner: {
        type: String,
        required: true
    },
    faculty: {
        type: String,
        required: true
    },
    title:{
        type: String,
        require: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }    
})

module.exports = mongoose.model('Noti', NotiSchema)