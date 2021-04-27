const mongoose = require('mongoose')

const FacultySchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('Faculty', FacultySchema)