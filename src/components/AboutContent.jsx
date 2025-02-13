import React from 'react';

const AboutContent = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">About RateMyClub</h1>
          
          <div className="space-y-6 text-lg text-gray-700">
            <p>
              RateMyClub is a platform designed to help university students make informed decisions about which clubs to join. We believe that extracurricular activities are a crucial part of the college experience, and choosing the right clubs can significantly impact a student's journey.
            </p>

            <p>
              Our mission is to create transparency in university club culture by providing a space where students can anonymously share their experiences, insights, and feedback about various clubs across different universities. Whether you're a freshman looking to get involved or a senior seeking new opportunities, RateMyClub helps you discover and evaluate clubs that align with your interests and goals.
            </p>

            <p>
              Key features of our platform include:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Anonymous reviews from real club members</li>
              <li>Comprehensive club listings from universities across the country</li>
              <li>Detailed information about club activities, time commitments, and opportunities</li>
              <li>User-friendly interface for finding and reviewing clubs</li>
            </ul>

            <p>
              We strive to maintain a helpful and constructive environment where students can share honest feedback while respecting the efforts of club organizers and members. Our goal is to help students find their perfect fit in the vast landscape of university clubs and organizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutContent;
