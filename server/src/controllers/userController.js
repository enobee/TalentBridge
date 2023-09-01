const User = require('../models/userModel')



// Controller for signup user
const signupUser = async (req, res) => {
    
    try {
        const { firstname, lastname, email, password } = req.body;
        const user = await User.signup(
            firstname,
            lastname,
            email,
            password
            );
            res.json({ message: "User created. Please verify your email." });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    
    // Controller for email verification
    const verifyEmail = async (req, res) => {
        try {
            const { token } = req.params;
            const user = await User.verifyEmail(token);
            res.json({ message: 'Email verified successfully. Please sign in' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    
    // Controller for login user
    const loginUser = async (req, res) => {
        const {email, password} = req.body
    
        try {
          const user = await User.login( email, password);
    
           res.status(200).json({ message: "Login successful", user, token: user.token });
           console.log(token)
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
        
    }
// Controller for initiating password reset
const initiatePasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        await User.initiatePasswordReset(email);
        res.json({ message: 'Password reset initiated. Check your email for instructions.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controller for resetting password using reset token
const resetPasswordWithToken = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const resetToken = req.params.token; // Assuming token is passed as a URL parameter

        if (newPassword !== confirmPassword) {
          return res.status(400).json({ error: "Passwords do not match" });
        }

        await User.resetTokenWithPassword(resetToken, newPassword);
        res.json({ message: 'Password reset successful.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// // Controller for updating User Profile
// const updateUserProfile = async (req, res) => {

//   try {
//     const userId = req.user._id; 
//     console.log(userId)
    
//     const {
//       firstname,
//       lastname,
//       email,
//       jobTitle,
//       userBio,
//       age,
//       location,
//       skills,
//       personalWebsite,
//       socialMedia,
//     } = req.body;

//     upload.fields([
//       { name: "profilePicture", maxCount: 1 },
//       { name: "resume", maxCount: 1 },
//     ])(req, res, async (err) => {
//       if (err) {
//         return res.status(400).json({ error: "File upload error" });
//       }

//       const profilePicturePath = req.file["profilePicture"]
//         ? req.files["profilePicture"][0].filename
//         : undefined;
//       const resumePath = req.file["resume"]
//         ? req.files["resume"][0].filename
//         : undefined;

//       const updates = {
//         firstname,
//         lastname,
//         email,
//         jobTitle,
//         userBio,
//         age,
//         location,
//         skills,
//         personalWebsite,
//         socialMedia,
//       };

//       const updatedUser = await User.updateUserProfile(
//         userId,
//         updates,
//         profilePicturePath,
//         resumePath
//       );

//       res.json({ message: "Profile updated successfully", user: updatedUser });
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Error updating profile" });
//   }
// };

const updateUserProfile = async (req, res) => {
  try {
    console.log({ ReqBody: req.body });
    const { firstname, lastname, email, jobTitle, userBio, age, location, skills, personalWebsite, socialMedia } = req.body;

      console.log({ RequestFiles: req.files });
  
      const { profilePicture, resume } = req.files;
      const profilePicturePath = profilePicture[0].filename;
      const resumePath = resume[0].filename;

      const token = req.header("Authorization").replace("Bearer ", "");

      const updates = {
        firstname,
        lastname,
        email,
        jobTitle,
        userBio,
        age,
        location,
        skills,
        personalWebsite,
        socialMedia,
      };
      const updatedUser = await User.updateUserProfile(
        token, 
        updates,
        profilePicturePath,
        resumePath
      );
      console.log({ Updates: updates });

      res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
   
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating profile" });
  }
};


module.exports = {
  signupUser,
  verifyEmail,
  loginUser,
  initiatePasswordReset,
  resetPasswordWithToken,
  updateUserProfile
};