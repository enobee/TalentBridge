const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const { sendEmail } = require("../utils/emailUtils");
const { findMatchingJobs } = require("../utils/findJobMatching");
const { hashPassword, comparePasswords } = require("../utils/bcryptUtils");

// const { createError } = require('../middleware/createError')

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
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
    company: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "employer", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    jobTitle: {
      type: String,
    },
    userBio: { type: String },
    skills: [
      {
        type: String,
      },
    ],
    age: {
      type: Number,
    },
    location: {
      type: String,
    },
    personalWebsite: {
      type: String,
    },
    resume: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    socialMedia: {
      linkedin: {
        type: String,
      },
      github: {
        type: String,
      },
    },
    receiveJobNotifications: {
      type: Boolean,
      default: false,
    },
    jobPreferences: [
      {
        type: String,
      },
    ],
    notifiedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobListing" }],
  },
  { timestamps: true }
);

// Static method for user signup
userSchema.statics.signup = async function (
  firstname,
  lastname,
  email,
  password
) {
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

  const hashedPassword = await hashPassword(password);

  const user = await this.create({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    isVerified: false,
  });

  // Create a JWT for email verification using user's _id
  const verificationToken = jwt.sign(
    { userId: user._id },
    process.env.SECRET,
    { expiresIn: "10m" } // Token expires in 10 min
  );

  // Send verification email
  const subject = "Account Verification";
  const html = `
        <p>Dear ${firstname},</p>
        <p>Thank you for signing up for TalentBridge. Click on the link below to verify your email:</p>
        <a href="${process.env.APP_URI}/api/user/verify/${verificationToken}">Verify Email</a>
        <p>This link will expire in 10 minutes. If you did not sign up for a TalentBridge account,
          you can safely ignore this email.</p>
        <br>

        <p>Best,</p>

        <p>The TalentBridge Team</p>
    `;

  await sendEmail(email, subject, html);

  return user; // Return the verification token for testing purposes
};

// Static method for verifying email
userSchema.statics.verifyEmail = async function (token) {
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log({ Decoded: decoded });

    // Find the user by _id
    const user = await this.findById(decoded.userId);

    if (!user) {
      throw Error("User not found");
    }

    if (user.isVerified) {
      throw Error("Email already verified");
    }

    user.isVerified = true;
    await user.save();

    return user;
  } catch (error) {
    throw Error("Invalid or expired verification token");
  }
};

// Static method for user login
userSchema.statics.login = async function (email, password) {
  // validation
  if (!email || !password) {
    throw Error("All fields must be filled");
  }
  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Invalid Login Credentials");
  }

  const match = await comparePasswords(password, user.password);

  if (!match) {
    throw Error("Invalid Login Credentials");
  }

  // If user is not verified, prevent login
  if (!user.isVerified) {
    throw Error("Email not verified. Please verify your email first.");
  }

  // Generate an authentication token
  const authToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { user, authToken };
};

// Static method for initiating password reset
userSchema.statics.initiatePasswordReset = async function (email) {
  const user = await this.findOne({ email });

  if (!user) {
    throw Error("User not found");
  }

  // Create a JWT for password reset
  const resetToken = jwt.sign(
    { userId: user._id },
    process.env.SECRET,
    { expiresIn: "10m" } // Token expires in 1 day
  );

  // Send password reset email

  const subject = "Password Reset";
  const html = `
            <p>Dear ${user.firstname},</p>
            <p>Click the following link to reset your password:</p>
            <a href="process.env.APP_URI/api/user/reset-password/${resetToken}">Reset Password</a>
            console.log(href)
        `;

  sendEmail(email, subject, html);
};

// Static method for resetting password with token
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
    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    return user;
  } catch (error) {
    throw Error("Invalid or expired reset token");
  }
};

// Static method for updating user profile
userSchema.statics.updateUserProfile = async function (
  token,
  updates,
  profilePicturePath,
  resumePath
) {
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);

    const user = await this.findById(decodedToken.userId);

    // Delete previous profile picture and resume
    if (user.profilePicture) {
      const pathToUploads = path.join(__dirname, "../../public/uploads");
      console.log(pathToUploads);
      console.log(user.profilePicture);
      fs.unlinkSync(path.join(pathToUploads, user.profilePicture));
    }
    if (user.resume) {
      const pathToUploads = path.join(__dirname, "../../public/uploads");
      fs.unlinkSync(path.join(pathToUploads, user.resume));
    }

    // Update user's profile fields
    const updatedUser = await this.findByIdAndUpdate(
      decodedToken.userId,
      {
        $set: {
          ...updates,
          profilePicture: profilePicturePath,
          resume: resumePath,
        },
      },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// Static method for Employers Registration
userSchema.statics.registerEmployer = async function (
  firstname,
  lastname,
  email,
  company,
  password
) {
  try {
    console.log({ RegisterEmployer: email });
    // validation
    if (!firstname || !lastname || !email || !company || !password) {
      throw Error("All fields must be filled");
    }
    if (!validator.isEmail(email)) {
      throw Error("Email is not Valid");
    }
    if (!validator.isStrongPassword(password)) {
      throw Error("Password not strong enough");
    }
    // Check if the email is already registered
    const existingUser = await this.findOne({ email });
    if (existingUser) {
      throw new Error("Email is already registered.");
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new user with the "employer" role
    const employer = new this({
      email,
      password: hashedPassword,
      role: "employer",
      firstname,
      lastname,
      company,
    });
    // Create a JWT for email verification using user's _id
    const verificationToken = jwt.sign(
      { userId: employer._id },
      process.env.SECRET,
      { expiresIn: "10m" } // Token expires in 10 min
    );

    // Send verification email
    const subject = "Account Verification";
    const html = `
        <p>Dear ${firstname},</p>
        <p>Thank you for signing up for TalentBridge. Click on the link below to verify your email:</p>
        <a href="${process.env.APP_URI}/api/user/verify/${verificationToken}">Verify Email</a>
        <p>This link will expire in 10 mins. If you did not sign up for a TalentBridge account,
          you can safely ignore this email.</p>
        <br>

        <p>Best,</p>

        <p>The TalentBridge Team</p>
    `;

    await sendEmail(email, subject, html);

    // Save the employer user to the database
    await employer.save();

    return employer;
  } catch (error) {
    throw error;
  }
};

// Static method for promoting user to admin
userSchema.statics.promoteToAdmin = async function (email) {
  try {
    const user = await this.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already an admin
    if (user.role === "admin") {
      throw new Error("User is already an admin");
    }

    // Promote the user to admin
    user.role = "admin";

    // Save the updated user document
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
};

// Static method for getting All Users (This is for only admins)
userSchema.statics.getAllUsers = async function () {
  try {
    const users = await this.find();
    return users;
  } catch (error) {
    throw new Error(`Error fetching all users: ${error.message}`);
  }
};

// Statics method for getting user profile (It is applicable for both admins and employers(If employers want to see applicants profile))
userSchema.statics.getUserProfile = async function (userId) {
  try {
    // Fetch the user's profile by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// Static method for sending job notifications
userSchema.statics.sendJobNotifications = async function () {
  try {
    const JobListing = mongoose.model("JobListing"); // Replace 'JobListing' with your actual model name

    // Retrieve all users with job preferences who want to receive notifications
    const usersWithPreferences = await this.find({
      jobPreferences: { $exists: true, $not: { $size: 0 } }, // Users with non-empty preferences
      receiveJobNotifications: true, // Assuming you have a field for this setting
      isVerified: true, // Optionally, ensure users are verified
    });

    // Loop through each user
    usersWithPreferences.forEach(async (user) => {
      // Find all job listings
      const jobListings = await JobListing.find();

      // Use the corrected findMatchingJobs function
      const matchedJobs = findMatchingJobs(user, jobListings);

      // Find new jobs that haven't been notified yet
      const newJobsToNotify = matchedJobs.filter((job) => {
        return !user.notifiedJobs.includes(job._id);
      });

      if (newJobsToNotify.length > 0) {
        const jobTitles = newJobsToNotify.map((job) => job.title).join(", ");

        // Send email here...

        // Create a list of clickable job title links
        // const jobTitleLinks = jobTitles
        //   .map((jobTitle) => {
        //     const jobPageURL = `https://your-website.com/job/${encodeURIComponent(
        //       jobTitle
        //     )}`;
        //     return `<a href="${jobPageURL}">${jobTitle}</a>`;
        //   })
        //   .join("<br>");

        const subject = "New Job Matches";
        const html = `
        <p>New jobs that match your preferences: ${jobTitles}.</p>
        <br>

        <p>Best,</p>

        <p>The TalentBridge Team</p>
    `;

        await sendEmail(user.email, subject, html);

        // Update user's notifiedJobs with the IDs of the newly notified jobs
        user.notifiedJobs = user.notifiedJobs.concat(
          newJobsToNotify.map((job) => job._id)
        );
        await user.save();
      }
    });
  } catch (error) {
    throw error;
  }
};

// Static method for deleting user account;
userSchema.statics.deleteUser = async function (userId, email) {
  try {
    // Find the user by their ID and remove them from the database
    const deletedUser = await this.findByIdAndRemove(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (deletedUser.email !== email) {
      return res.status(400).json({
        error: "Email confirmation failed. Please provide the correct email.",
      });
    }
    return deletedUser;
  } catch (error) {
    throw error;
  }
};

// Schedule the task to run daily
cron.schedule("0 0 * * *", () => {
  this.sendJobNotifications();
});

module.exports = mongoose.model("User", userSchema);
