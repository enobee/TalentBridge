const mongoose = require("mongoose");

const jobListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    description: {
      type: String,
    },
    salary: { type: String },

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
    keywords: [{ type: String }],
    jobType: {
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
    throw error;
  }
};

// Static method to update a job listing by ID
jobListingSchema.statics.updateJobListing = async function (
  jobListingId,
  data
) {
  try {
    console.log(jobListingId);
    console.log(data);
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
      throw new Error("Job listing not found");
    }
    return updatedJobListing;
  } catch (error) {
    throw error;
  }
};

// Static method to delete a job listing by ID
jobListingSchema.statics.deleteJobListing = async function (jobListingId) {
  try {
    const deletedJobListing = await this.findByIdAndRemove(jobListingId);
    if (!deletedJobListing) {
      throw new Error("Job listing not found");
    }
    return deletedJobListing;
  } catch (error) {
    throw error;
  }
};

// Static method to get all job listings
jobListingSchema.statics.getAllJobListings = async function () {
  try {
    return await this.find().populate("postedBy");
  } catch (error) {
    throw error;
  }
};

// Static method to get a job listing by ID
jobListingSchema.statics.getJobListingById = async function (jobListingId) {
  try {
    return await this.findById(jobListingId).populate("postedBy");
  } catch (error) {
    throw error;
  }
};

// jobListingSchema.statics.paginateJobListings = async function (
//   page,
//   perPage,
//   query
// ) {
//   try {
//     const totalJobs = await this.countDocuments(query);
//     const totalPages = Math.ceil(totalJobs / perPage);

//    ** const options = {
//     page: parseInt(page, 10) || 1,
//     limit: parseInt(perPage, 10) || 10,
//   };**...look at this later

//   const sort = { createdAt: -1 }; // Sort by createdAt in descending order

//     // Apply pagination
//     const jobListings = await this.find(query)
//       .sort(sort)
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .populate("postedBy"); // Populate the 'postedBy' field with user details

//     return {
//       jobListings,
//       totalPages,
//     };
//   } catch (error) {
//     throw error;
//   }
// };

jobListingSchema.statics.filterJobListings = async function (
  filterCriteria
  //   page,
  //   limit
) {
  try {
    const query = {};

    if (filters.title) {
      query.title = { $regex: filterCriteria.title, $options: "i" }; // Case-insensitive title search
    }

    if (filters.location) {
      query.location = { $regex: filterCriteria.location, $options: "i" }; // Case-insensitive location search
    }

    // const skip = (page - 1) * limit;

    const jobListings = await this.find(query).sort({ createdAt: -1 }); // Sort by creation date, descending
    //   .skip(skip)
    //   .limit(limit);

    return jobListings;
  } catch (error) {
    throw error;
  }
};

//
jobListingSchema.statics.searchJobListings = async function (
  searchQuery
  //   page,
  //   limit
) {
  try {
    const query = {};

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } }, // Case-insensitive title search
        { description: { $regex: searchQuery, $options: "i" } }, // Case-insensitive description search
        { location: { $regex: searchQuery, $options: "i" } }, // Case-insensitive location search
      ];
    }

    // const skip = (page - 1) * limit;

    const jobListings = await this.find(query).sort({ createdAt: -1 }); // Sort by creation date, descending
    //   .skip(skip)
    //   .limit(limit);

    return jobListings;
  } catch (error) {
    throw error;
  }
};

// Statics method to apply for jobs
jobListingSchema.statics.applyToJob = async function (jobId, userId) {
  try {
    const job = await this.findById(jobId);

    // Check if the job is posted by an employer (jobType references an "employer" user)
    if (job.jobType === "employer") {
      job.applicants.push(userId);
      await job.save();
      return "Application submitted successfully.";
    } else {
      return "Please use the application link posted to apply for this job.";
    }
  } catch (error) {
    throw error;
  }
};

JobListingSchema.statics.findApplicantsForJob = async function (jobId) {
  try {
    const job = await this.findById(jobId);
    if (!job) {
      throw new Error("Job listing not found");
    }
    return job.applicants;
  } catch (error) {
    throw error;
  }
};

const JobListing = mongoose.model("JobListing", jobListingSchema);

module.exports = JobListing;
