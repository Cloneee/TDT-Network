const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    owner: {
        fullname: {
            type: String,
            required: true
        },
        mssv: {
            type: String,
            required: true
        }
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    image:{
        type: String
    },
    video: {
        type: String
    },
    comments:[{
        user: String,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
})

module.exports = mongoose.model('Post', PostSchema)