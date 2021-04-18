const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    owner: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
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