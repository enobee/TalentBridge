const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const userRoutes = require('./routes/userRoute')
const createError = require('./middleware/createError')

// express app
const app = express()

// middleware
app.use(express.json())

//routes
app.use('/api/user', userRoutes)

// connect to db
mongoose.connect(process.env.MONGO_URI)
 .then(() => {
     // listen for requests
     app.listen(process.env.PORT, () => {
         console.log('connected to db & listening on port', process.env.PORT)
     })
 })
 .catch((error) => {
    console.log(error)
 })
