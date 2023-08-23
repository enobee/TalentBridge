const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { createError } = require('../middleware/createError')

const Schema = mongoose.Schema

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

// static signup method

userSchema.statics.signup = async function(firstname, lastname, email, password) {
    
    const exists = await this.findOne({ email})

    if (exists) {
        throw Error ('Email already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({ firstname, lastname, email, password: hash })

    return user
}

module.exports = mongoose.model('User', userSchema)