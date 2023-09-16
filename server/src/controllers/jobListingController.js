const JobListing = require("../models/jobListingModel");

// Controller for creating job listing
const createJobListing = async (req, res) => {
  try {
    const {
      title,
      description,
      skills,
      availability,
      experienceLevel,
      language,
      jobType,
      salary,
      companyName,
      companyWebsite,
      location,
    } = req.body;
    const userId = req.user.id;
    const jobRole = req.user.role;

    const jobListingData = {
      title,
      description,
      skills,
      availability,
      experienceLevel,
      language,
      jobType,
      salary,
      companyName,
      companyWebsite,
      location,
      postedBy: userId, // Assign the user who is posting the job listing
      jobRole: jobRole,
    };

    const newJobListing = await JobListing.createJobListing(jobListingData);
    res.status(201).json(newJobListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for updating job listing
const updateJobListing = async (req, res) => {
  try {
    const {
      title,
      description,
      skills,
      availability,
      experienceLevel,
      language,
      jobType,
      salary,
      companyName,
      companyWebsite,
      location,
    } = req.body;
    const { id } = req.params;

    const data = {
      title,
      description,
      skills,
      availability,
      experienceLevel,
      language,
      jobType,
      salary,
      companyName,
      companyWebsite,
      location,
    };

    const updatedJobListing = await JobListing.updateJobListing(id, data);

    res.status(200).json({ message: "Job listing updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for Deleting a job listing
const deleteJobListing = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedJobListing = await JobListing.deleteJobListing(id);

    res.status(200).json({ message: "Job Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for getting ALL job listing
const getAllJobListings = async (req, res) => {
  try {
    const jobListings = await JobListing.getAllJobListings();

    res.status(200).json(jobListings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for getting a job listing by ID
const getJobListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const jobListing = await JobListing.getJobListingById(id);

    res.status(200).json(jobListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for searching for job listing
const searchJobListing = async (req, res) => {
  const { search } = req.query;
  try {
    const jobListings = await JobListing.searchJobListings(search);
    res.status(200).json(jobListings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for filtering job listing
const filterJobListing = async (req, res) => {
  const { filterCriteria } = req.query;
  try {
    const jobListings = await JobListing.filterJobListings(filterCriteria);
    res.status(200).json(jobListings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const applyToJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await JobListing.applyToJob(id, userId);

    res.status(201).json({ message: "Job Applied Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getApplicantsForJob = async (req, res) => {
  try {
    const { id } = req.params;

    const applicants = await JobListing.findApplicantsForJob(id);

    res.status(200).json({ applicants });
  } catch (error) {
    res.status(500).json({ error: "Error fetching applicants for the job" });
  }
};

module.exports = {
  createJobListing,
  updateJobListing,
  deleteJobListing,
  getAllJobListings,
  getJobListingById,
  searchJobListing,
  filterJobListing,
  applyToJob,
  getApplicantsForJob,
};
