const User = require("../models/userModel");

// Controller for signup user
const signupUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const user = await User.signup(firstname, lastname, email, password);
    res.json({ message: "User created. Please verify your email." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller for Employers sign up
const employerSignUp = async (req, res) => {
  try {
    console.log({ Employer: req.body });
    const { firstname, lastname, email, password, company } = req.body;
    const employer = await User.registerEmployer(
      firstname,
      lastname,
      email,
      password,
      company
    );
    res.json({
      message: "Employer signup successful. Please verify your email.",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller for email verification
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.verifyEmail(token);
    res.json({ message: "Email verified successfully. Please sign in" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller for login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    res
      .status(200)
      .json({ message: "Login successful", user, token: user.token });
    console.log(token);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller for initiating password reset
const initiatePasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    await User.initiatePasswordReset(email);
    res.json({
      message: "Password reset initiated. Check your email for instructions.",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller for resetting password using reset token
const resetPasswordWithToken = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const resetToken = req.params.token;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    await User.resetTokenWithPassword(resetToken, newPassword);
    res.json({ message: "Password reset successful." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    console.log({ ReqBody: req.body });
    const {
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
      receiveJobNotifications,
      jobPreferences,
    } = req.body;

    console.log({ RequestFiles: req.files });

    const { profilePicture, resume } = req.files;
    const profilePicturePath = profilePicture[0].filename;
    const resumePath = resume[0].filename;

    // const token = req.header("Authorization").replace("Bearer ", "");
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader.split(" ")[1];

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
      receiveJobNotifications,
      jobPreferences,
    };
    const updatedUser = await User.updateUserProfile(
      token,
      updates,
      profilePicturePath,
      resumePath
    );
    console.log({ Updates: updates });

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating profile" });
  }
};

const promoteToAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.promoteToAdmin(email);

    return res
      .status(200)
      .json({ message: `User with email ${email} is now an admin`, user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const sendJobNotification = async (req, res) => {
  try {
    await User.sendJobNotifications(); // Trigger the static method

    res.status(200).json({ message: "Job notifications sent successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error sending job notifications" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await JobListing.getAllUsers();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signupUser,
  verifyEmail,
  loginUser,
  initiatePasswordReset,
  resetPasswordWithToken,
  updateUserProfile,
  promoteToAdmin,
  sendJobNotification,
  employerSignUp,
  getAllUsers,
};
