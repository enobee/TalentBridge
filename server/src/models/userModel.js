const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const { sendEmail } = require("../utils/emailUtils");


// const { createError } = require('../middleware/createError')

const Schema = mongoose.Schema

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
});

// static signup method

userSchema.statics.signup = async function(firstname, lastname, email, password) {
  // validation

  if (!firstname || !lastname || !email || !password) {
    throw Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not Valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({
    firstname,
    lastname,
    email,
    password: hash,
    isVerified: false,
  });

  // Create a JWT for email verification using user's _id
  const token = jwt.sign(
    { userId: user._id },
    process.env.SECRET,
    { expiresIn: "10m" } // Token expires in 10 min
  );

  // Send verification email
  const subject = "Account Verification";
  const html = `
        <p>Dear ${firstname},</p>
        <p>Click the following link to verify your email:</p>
        <a href="http://localhost:4000/api/user/verify/${token}">Verify Email</a>
    `;

  await sendEmail(email, subject, html);

  return user; // Return the verification token for testing purposes
}

// Static method for verifying email
userSchema.statics.verifyEmail = async function(token) {
    try {
        console.log({VerifiedToken: token})
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log({Decoded: decoded})

        // Find the user by _id
        const user = await this.findById(decoded.userId);
        console.log({verifiedUser: user})

        if (!user) {
            throw Error('User not found');
        }

        if (user.isVerified) {
            throw Error('Email already verified');
        }

        user.isVerified = true;
        await user.save();

        return user;
    } catch (error) {
        throw Error('Invalid or expired verification token');
    }
};

// static login method

userSchema.statics.login = async function(email, password) {
  // validation
  if (!email || !password) {
    throw Error("All fields must be filled");
  }
  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Invalid Login Credentials");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Invalid Login Credentials");
  }

  // If user is not verified, prevent login
  if (!user.isVerified) {
    throw Error("Email not verified. Please verify your email first.");
  }

  return user;
}

// Static method for initiating password reset
userSchema.statics.initiatePasswordReset = async function(email) {
    const user = await this.findOne({ email });

    if (!user) {
        throw Error("User not found");
    }

    // Create a JWT for password reset
    const resetToken = jwt.sign(
        { userId: user._id },
        process.env.SECRET,
        { expiresIn: '10m' } // Token expires in 1 day
    );

    // Send password reset email

    const subject = "Password Reset";
    const html = `
            <p>Dear ${user.firstname},</p>
            <p>Click the following link to reset your password:</p>
            <a href="http://localhost:4000/api/user/reset-password/${resetToken}">Reset Password</a>
        `;


   sendEmail(email, subject, html);
};

userSchema.statics.resetPasswordWithToken = async function (
  resetToken,
  newPassword
) {
  try {
    const decoded = jwt.verify(resetToken, process.env.SECRET);

    const user = await this.findById(decoded.userId);

    if (!user) {
      throw Error("User not found");
    }

    // Update user's password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    user.password = hash;
    await user.save();

    return user;
  } catch (error) {
    throw Error("Invalid or expired reset token");
  }
};

module.exports = mongoose.model('User', userSchema)