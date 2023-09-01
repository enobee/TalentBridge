const express = require('express')
const upload = require("../middleware/multerConfig"); 

// controller functions
const { signupUser, verifyEmail, loginUser, initiatePasswordReset, resetPasswordWithToken, updateUserProfile } = require('../controllers/userController')

const router = express.Router()


// Route for signing up user
router.post('/signup', signupUser)

// Route for email verification
router.get("/verify/:token", verifyEmail);

//Route for logging in user
router.post('/login', loginUser)

// Route for initiating password reset
router.post('/initiate-password-reset', initiatePasswordReset);

// Route for resetting password using reset token
router.post('/reset-password-with-token', resetPasswordWithToken);

// Route for updating user profile
router.post(
  "/update-profile",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateUserProfile
);



module.exports = router