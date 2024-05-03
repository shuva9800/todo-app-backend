const mongoose = require('mongoose');

const TodoItem = new mongoose.Schema({
    name:{
        type:"string",
        required: true,
    },
    description:{
        type: 'string',
        required: true
    },
    status: {
        type: 'String',
        enum: ['pending', 'completed'],
        default: 'pending' // Optional: Set a default value
    }
})

module.exports = mongoose.model("Todo",TodoItem)