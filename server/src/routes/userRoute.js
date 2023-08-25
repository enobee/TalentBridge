const express = require('express')

// controller functions
const { signupUser, verifyEmail, loginUser, initiatePasswordReset, resetPasswordWithToken } = require('../controllers/userController')

const router = express.Router()

//login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// Email verification route
router.get("/verify/:token", verifyEmail);

// Route for initiating password reset
router.post('/initiate-password-reset', initiatePasswordReset);

// Route for resetting password using reset token
router.post('/reset-password-with-token', resetPasswordWithToken);



module.exports = router