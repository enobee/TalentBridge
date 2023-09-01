const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const path = require("path");

// const upload = require("./middleware/multerConfig"); 
const userRoutes = require('./routes/userRoute')

// express app
const app = express()

// middleware

app.use(express.json())
// app.use(
//   upload.fields([
//     { name: "profilePicture", maxCount: 1 },
//     { name: "resume", maxCount: 1 }
//   ])
// );

// Serve uploaded files as static assets
app.use(
  "/update-profile",
  express.static(path.join(__dirname, "../../public", "uploads"))
);

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
