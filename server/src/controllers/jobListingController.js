const JobListing = require("../models/jobListingModel");

// Controller for creating job listing
const createJobListing = async (req, res) => {
  try {
    const { title, description, location, salary } = req.body;
    const userId = req.user.id; 

    const jobListingData = {
      title,
      description,
      location,
      salary,
      postedBy: userId, // Assign the user who is posting the job listing
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
    const { title, description, location, salary } = req.body;
    const { jobListingId } = req.params;

    const updatedJobListing = await JobListing.updateJobListing(jobListingId, {
      title,
      description,
      location,
      salary,
    });

    res.json(updatedJobListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for Deleting a job listing
const deleteJobListing = async (req, res) => {
  try {
    const { jobListingId } = req.params;

    const deletedJobListing = await JobListing.deleteJobListing(jobListingId);

    res.json(deletedJobListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for getting ALL job listing
const getAllJobListings = async (req, res) => {
  try {
    const jobListings = await JobListing.getAllJobListings();

    res.json(jobListings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for getting a job listing by ID
const getJobListingById = async (req, res) => {
  try {
    const { jobListingId } = req.params;

    const jobListing = await JobListing.getJobListingById(jobListingId);

    res.json(jobListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for searching for job listing
const searchJobListing = async (req, res) => {
  const { search } = req.query;
  try {
    const jobListings = await JobListing.searchJobListings(search);
    res.json(jobListings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for filtering job listing
const filterJobListing = async (req, res) => {
    const { filterCriteria } = req.query;
    try {
        const jobListings = await JobListing.filterJobListings(filterCriteria);
        res.status(200).json(jobListings)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Controller for paginating job listings
// const paginateJobListing = async (req, res) => {
//     const { page, perPage } = req.query;
//     try {
//       const jobListings = await JobListing.paginateJobListings(page, perPage);
//       res.status(200).json(jobListings);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
// }


const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id; 

    const message = await JobListing.applyToJob(jobId, userId);

    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createJobListing,
  updateJobListing,
  deleteJobListing,
  getAllJobListings,
  getJobListingById,
  searchJobListing,
  applyToJob
};
