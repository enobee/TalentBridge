const express = require('express')
const upload = require("../middleware/multerConfig"); 

// controller functions
const {
  signupUser,
  verifyEmail,
  loginUser,
  initiatePasswordReset,
  resetPasswordWithToken,
  updateUserProfile,
  promoteToAdmin,
  sendJobNotification
} = require("../controllers/userController");

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

// Route for promoting user to Admin
router.post('/promote', promoteToAdmin)

// Route for sending job notification
router.post(
  "/sendJobNotifications", sendJobNotification);



module.exports = router