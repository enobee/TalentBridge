function findMatchingJobs(user, jobListings) {
  const matchedJobs = [];

  for (const job of jobListings) {
    // Convert the job title to lowercase for case-insensitive comparison
    const jobTitle = job.title.toLowerCase();

    // Check if the job title matches any of the user's preferred titles (case-insensitive)
    if (user.jobPreferences.some((pref) => pref.toLowerCase() === jobTitle)) {
      matchedJobs.push(job);
      continue; // Skip further checks for this job if title matches
    }

    // Check if the job's keywords match any of the user's jobPreferences (case-insensitive)
    const jobKeywords = job.keywords || [];

    for (const keyword of jobKeywords) {
      // Convert the keyword to lowercase for case-insensitive comparison
      const lowercaseKeyword = keyword.toLowerCase();

      if (
        user.jobPreferences.some(
          (pref) => pref.toLowerCase() === lowercaseKeyword
        )
      ) {
        matchedJobs.push(job);
        break; // Exit loop if a keyword match is found
      }
    }
  }
  return matchedJobs;
}

module.exports = {
  findMatchingJobs
};
