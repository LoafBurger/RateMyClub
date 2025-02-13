import React from "react";

const ClubReviewSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* First Feature Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-24">
        <div className="lg:w-1/2">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Find your university
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            We've collected club reviews from universities across the country.
            Search for your school to get started and explore the vibrant club
            scene.
          </p>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-80 h-80">
            <div className="absolute inset-0 bg-[#e6f6fd] rounded-lg flex items-center justify-center">
              <svg
                className="w-32 h-32 text-[#00a6fb]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9l9-6 9 6M4 9v12h16V9M9 21v-6h6v6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Second Feature Section */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-80 h-80">
            <div className="absolute inset-0 bg-[#e6f6fd] rounded-lg flex items-center justify-center">
              <svg
                className="w-32 h-32 text-[#00a6fb]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Write an anonymous review
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Share your experience with university clubs by writing a review.
            Help other students make informed decisions about which clubs to
            join. Your reviews are completely anonymous.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClubReviewSection;
