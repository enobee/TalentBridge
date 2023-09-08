const bcrypt = require("bcrypt");

// Function to hash a password
async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

// Function to compare a password with a hashed password
async function comparePasswords(inputPassword, hashedPassword) {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePasswords,
};
