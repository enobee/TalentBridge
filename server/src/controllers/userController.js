const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d'})
}

// login user
const loginUser = async (req, res) => {
    const {email, password} = req.body

    try {
      const user = await User.login( email, password);

      // create a token
      const token = createToken(user._id);

      res.status(200).json({ email, token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
    
}

// signup user
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
        const { resetToken, newPassword } = req.body;
        await User.resetPasswordWithToken(resetToken, newPassword);
        res.json({ message: 'Password reset successful.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = {
  signupUser,
  verifyEmail,
  loginUser,
  initiatePasswordReset,
  resetPasswordWithToken
};