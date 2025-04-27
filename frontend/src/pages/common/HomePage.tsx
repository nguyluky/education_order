import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-700 py-16 rounded-lg shadow-lg">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Connect with Expert Educators One-on-One
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            A personalized learning experience that helps you master any subject with verified tutors.
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-6 py-3 text-primary-600 font-bold rounded-lg shadow hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-transparent border-2 font-bold rounded-lg hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
            </div>
          ) : (
            <Link
              to={user?.user_type === 'student' ? '/educators' : '/sessions'}
              className="px-6 py-3 bg-white text-primary-600 font-bold rounded-lg shadow hover:bg-gray-100 transition-colors"
            >
              {user?.user_type === 'student' ? 'Find Tutors' : 'Manage Sessions'}
            </Link>
          )}
        </div>
      </section>

      {/* Features section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Student features */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-500">
            <h3 className="text-xl font-bold mb-4">For Students</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Create an account and select favorite subjects</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Browse verified educators and their qualifications</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Schedule 1:1 lessons at your preferred time</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Pay for tutoring sessions securely</span>
              </li>
            </ul>
          </div>

          {/* Educator features */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-secondary-500">
            <h3 className="text-xl font-bold mb-4">For Educators</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-secondary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Become a tutor by uploading your degree certification</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-secondary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Set your own hourly rate (e.g., $7 per hour)</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-secondary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Accept or decline student booking requests</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-secondary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Get paid after each completed session</span>
              </li>
            </ul>
          </div>

          {/* Security features */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-gray-500 md:col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">Security & Verification</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>ID verification for all tutors</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Educators sign professional teaching agreements</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Secure payment escrow until session completion</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Subjects section */}
      <section className="bg-gray-50 py-12 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Explore Subjects</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-center">
            {['Mathematics', 'English', 'Science', 'Physics', 'Chemistry',
              'Biology', 'Spanish', 'Chinese', 'Computer Science', 'History'].map((subject) => (
              <div
                key={subject}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                {subject}
              </div>
            ))}
          </div>
          {isAuthenticated ? (
            <div className="text-center mt-8">
              <Link
                to="/subjects"
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                View All Subjects
              </Link>
            </div>
          ) : (
            <div className="text-center mt-8">
              <Link
                to="/register"
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign Up to Explore More
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-secondary-700 py-12 rounded-lg shadow-lg">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Whether you're looking to learn or to share your knowledge, join our platform today.
          </p>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-secondary-700 font-bold rounded-lg shadow hover:bg-gray-100 transition-colors"
            >
              Join Education Order
            </Link>
          ) : (
            <Link
              to={user?.user_type === 'student' ? '/educators' : '/sessions'}
              className="px-6 py-3 bg-white text-secondary-700 font-bold rounded-lg shadow hover:bg-gray-100 transition-colors"
            >
              {user?.user_type === 'student' ? 'Find Your Tutor Now' : 'Start Teaching'}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;