const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const cors = require("cors");

const userRoutes = require("./routes/userRoute");
const jobListingRoutes = require("./routes/jobListingRoute");

// express app
const app = express();

// middleware

app.use(express.json());
app.use(cors());


// Serve uploaded files as static assets
app.use(
  "/update-profile",
  express.static(path.join(__dirname, "../../public", "uploads"))
);

//routes
app.use("/api/user", userRoutes);
app.use("/api/job", jobListingRoutes);

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
