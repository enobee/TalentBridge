const express = require("express");

const {
  createJobListing,
  updateJobListing,
  deleteJobListing,
  getAllJobListings,
  getJobListingById,
  searchJobListing,
  filterJobListing,
  applyToJob,
  getApplicantsForJob,
} = require("../controllers/jobListingController");
const verifyToken = require("../middleware/verifyToken");
const onlyEmployerAndAdmin = require("../middleware/onlyEmployersAndAdmin");

const router = express.Router();

// Route for creating Job Listing
router.post(
  "/create-job-listing",
  verifyToken,
  onlyEmployerAndAdmin,
  createJobListing
);

// Route for updating job listing
router.put(
  "/update-job-listing/:id",
  verifyToken,
  onlyEmployerAndAdmin,
  updateJobListing
);

//Route for Deleting a job listing
router.delete(
  "/delete-job-listing/:id",
  verifyToken,
  onlyEmployerAndAdmin,
  deleteJobListing
);

// Route for getting ALL job listing
router.get("/job-listing", getAllJobListings);

// Route for getting a job listing by ID
router.get("/job-listing/:id", getJobListingById);

// Route for Searching through Job Listings
router.get("/search-job-listing", searchJobListing);

// Route for applying for a job
router.post("/job-listing/:id/apply", verifyToken, applyToJob);

// Route for getting application that applied for a Job
router.get(
  "/job-listing/:id/applicants",
  verifyToken,
  onlyEmployerAndAdmin,
  getApplicantsForJob
);

module.exports = router;
