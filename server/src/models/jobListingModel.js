const mongoose = require("mongoose");
const createError = require("../middleware/createError");

const jobListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    companyWebsite: {
      type: String,
    },
    experienceLevel: {
      type: String,
    },
    language: {
      type: String,
    },
    availability: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    salary: {
      type: String,
      required: true,
    },
    requirements: [{ type: String }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who posted the job
      required: true,
    },

    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to users who applied for the job
      },
    ],
    hasUserApplied: {
      type: Boolean,
      default: false,
    },
    keywords: [{ type: String }],
    jobRole: {
      // this is to differentiate between an admin posting a job and an employer.
      type: String,
      enum: ["admin", "employer"],
      required: true,
    },
  },
  { timestamps: true }
);

// Static method to create a new job listing
jobListingSchema.statics.createJobListing = async function (data) {
  try {
    const jobListing = new this(data);
    await jobListing.save();
    return jobListing;
  } catch (error) {
    return next(createError(500, "Error creating a job listing!"));
  }
};

// Static method to update a job listing by ID
jobListingSchema.statics.updateJobListing = async function (
  jobListingId,
  data
) {
  try {
    const updatedJobListing = await this.findByIdAndUpdate(
      jobListingId,
      {
        $set: {
          ...data,
        },
      },
      {
        new: true, // To return the updated document
      }
    );

    if (!updatedJobListing) {
      return next(createError(404, "Job listing not found"));
    }
    return updatedJobListing;
  } catch (error) {
    return next(createError(500, "Error updating a job listing"));
  }
};

// Static method to delete a job listing by ID
jobListingSchema.statics.deleteJobListing = async function (jobListingId) {
  try {
    const deletedJobListing = await this.findByIdAndRemove(jobListingId);
    if (!deletedJobListing) {
      return next(createError(404, "Job listing not found"));
    }
    return deletedJobListing;
  } catch (error) {
    return next(createError(500, "Error deleting a job listing!"));
  }
};

// Static method to get all job listings
jobListingSchema.statics.getAllJobListings = async function () {
  try {
    return await this.find().populate("postedBy");
  } catch (error) {
    return next(createError(500, "Error getting all job listings!"));
  }
};

// Static method to get a job listing by ID
jobListingSchema.statics.getJobListingById = async function (jobListingId) {
  try {
    return await this.findById(jobListingId).populate("postedBy");
  } catch (error) {
    return next(createError(500, "Error getting a job listing!"));
  }
};

// Static method for Searching for a job listing
jobListingSchema.statics.searchJobListings = async function (searchQuery) {
  try {
    const query = {};

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } }, // Case-insensitive title search
        { description: { $regex: searchQuery, $options: "i" } }, // Case-insensitive description search
        { location: { $regex: searchQuery, $options: "i" } }, // Case-insensitive location search
      ];
    }

    const jobListings = await this.find(query).sort({ createdAt: -1 }); // Sort by creation date, descending

    return jobListings;
  } catch (error) {
    return next(createError(500, "Error searching for job listing!"));
  }
};

// Statics method to apply for jobs
jobListingSchema.statics.applyToJob = async function (jobId, userId) {
  try {
    const job = await this.findById(jobId);

    // Check if the job is posted by an employer (jobType references an "employer" user)
    if (job.jobRole !== "employer") {
      return next(
        createError(
          400,
          "Please use the application link posted to apply for this job."
        )
      );
    }

    // Check if the user has already applied for this job
    if (job.hasUserApplied) {
      return next(
        createError(400, "You have already applied to this job listing.")
      );
    }
    // If the user hasn't applied, set the hasUserApplied field to true
    job.hasUserApplied = true;

    // Add the user's ID to the applicants array
    job.applicants.push(userId);
    await job.save();
    return "Application submitted successfully.";
  } catch (error) {
    return next(createError(500, "Error submitting application!"));
  }
};

// Statics method to find Applicants that applied for a job listing
jobListingSchema.statics.findApplicantsForJob = async function (jobId) {
  try {
    const job = await this.findById(jobId);
    if (!job) {
      return next(createError(400, "Job listing not found!"));
    }
    return job.applicants;
  } catch (error) {
    return next(
      createError(500, "Error getting applicants that applied for this job!")
    );
  }
};

const JobListing = mongoose.model("JobListing", jobListingSchema);

module.exports = JobListing;
