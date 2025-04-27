import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    bio: '',
    profilePicture: null as File | null,
  });
  
  const [formError, setFormError] = useState<string>('');
  const [userType, setUserType] = useState<'student' | 'educator'>('student');
  
  // Educator-specific fields
  const [educatorData, setEducatorData] = useState({
    degree: '',
    hourlyRate: 0,
    degreeCertificate: null as File | null,
    idVerification: null as File | null,
  });
  
  const { registerStudent, registerEducator, isAuthenticated, error, loading } = useAuth();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleEducatorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEducatorData({ ...educatorData, [name]: value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const { name } = e.target;
      
      if (name === 'degreeCertificate' || name === 'idVerification') {
        setEducatorData({ ...educatorData, [name]: e.target.files[0] });
      } else {
        setFormData({ ...formData, [name]: e.target.files[0] });
      }
    }
  };
  
  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return false;
    }
    
    if (userType === 'educator') {
      if (!educatorData.degree) {
        setFormError('Degree is required for educators');
        return false;
      }
      
      if (!educatorData.degreeCertificate) {
        setFormError('Degree certificate is required for educators');
        return false;
      }
      
      if (!educatorData.idVerification) {
        setFormError('ID verification is required for educators');
        return false;
      }
      
      if (educatorData.hourlyRate <= 0) {
        setFormError('Hourly rate must be greater than 0');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (userType === 'student') {
        await registerStudent({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          bio: formData.bio,
          profile_picture: formData.profilePicture,
          user_type: 'student',
        });
      } else {
        await registerEducator({
          user: {
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            password: formData.password,
            confirm_password: formData.confirmPassword,
            bio: formData.bio,
            profile_picture: formData.profilePicture,
          },
          degree: educatorData.degree,
          degree_certificate: educatorData.degreeCertificate,
          id_verification: educatorData.idVerification,
          hourly_rate: educatorData.hourlyRate,
        });
      }
    } catch (err) {
      // Error handling is managed by auth context
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
      
      {/* User type toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
              userType === 'student'
                ? 'bg-primary-600  border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setUserType('educator')}
            className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${
              userType === 'educator'
                ? 'bg-primary-600  border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Educator
          </button>
        </div>
      </div>
      
      {(error || formError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Common fields for all users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio (Optional)
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
            Profile Picture (Optional)
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>
        
        {/* Educator-specific fields */}
        {userType === 'educator' && (
          <>
            <div className="mt-6 border-t pt-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Educator Information</h2>
              
              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                  Highest Degree
                </label>
                <input
                  type="text"
                  id="degree"
                  name="degree"
                  value={educatorData.degree}
                  onChange={handleEducatorInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required={userType === 'educator'}
                />
              </div>
              
              <div className="mt-4">
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                  Hourly Rate (USD)
                </label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  min="1"
                  step="0.01"
                  value={educatorData.hourlyRate}
                  onChange={handleEducatorInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required={userType === 'educator'}
                />
              </div>
              
              <div className="mt-4">
                <label htmlFor="degreeCertificate" className="block text-sm font-medium text-gray-700">
                  Degree Certificate
                </label>
                <input
                  type="file"
                  id="degreeCertificate"
                  name="degreeCertificate"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                //   required={userType === 'educator'}
                />
                <p className="mt-1 text-xs text-gray-500">Upload a scan of your degree certificate (PDF, JPEG, or PNG)</p>
              </div>
              
              <div className="mt-4">
                <label htmlFor="idVerification" className="block text-sm font-medium text-gray-700">
                  ID Verification
                </label>
                <input
                  type="file"
                  id="idVerification"
                  name="idVerification"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                //   required={userType === 'educator'}
                />
                <p className="mt-1 text-xs text-gray-500">Upload a valid identification document (PDF, JPEG, or PNG)</p>
              </div>
            </div>
          </>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;