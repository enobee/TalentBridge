const multer = require("multer");
const path = require("path");

// Set up multer with disk storage
const storage = multer.diskStorage({
  // Specifies the destination folder for uploaded files
  destination: function (req, file, cb) {
    cb(null, "../public/uploads");
  },

  filename: (req, file, cb) => {
    // Create a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + "-" + uniqueSuffix + fileExtension;
    cb(null, fileName);
  },
});

// Create the multer middleware for profile picture and resume uploads
const upload = multer({ storage });

module.exports = upload;
