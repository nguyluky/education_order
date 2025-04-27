import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { ProfileService } from '../../services/profile/profile.service';
import { Educator, Student } from '../../types/common/models';

const profileService = new ProfileService();

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [userData, setUserData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    degree: '',
    hourlyRate: '',
  });
  
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [educatorProfile, setEducatorProfile] = useState<Educator | null>(null);
  
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [educatorDocs, setEducatorDocs] = useState({
    degreeCertificate: null as File | null,
    idVerification: null as File | null,
  });

  // Load profile data based on user type
  useEffect(() => {
    const fetchProfileData = async () => {
      if (authLoading || !user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (user.user_type === 'student') {
          const studentData = await profileService.getStudentProfile();
          setStudentProfile(studentData);
        } else if (user.user_type === 'educator') {
          const educatorData = await profileService.getEducatorProfile();
          setEducatorProfile(educatorData);
          
          // Update educator-specific form fields
          if (educatorData) {
            setUserData(prevData => ({
              ...prevData,
              degree: educatorData.degree,
              hourlyRate: educatorData.hourly_rate.toString(),
            }));
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user, authLoading]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };
  
  const handleEducatorDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const { name, files } = e.target;
      setEducatorDocs(prev => ({ ...prev, [name]: files[0] }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update basic user profile
      await profileService.updateUserProfile({
        first_name: userData.firstName,
        last_name: userData.lastName,
        bio: userData.bio,
      });
      
      // Upload profile picture if selected
      if (profilePicture) {
        await profileService.uploadProfilePicture(profilePicture);
      }
      
      // Update educator-specific details if user is an educator
      if (user?.user_type === 'educator' && educatorProfile) {
        await profileService.updateEducatorProfile({
          degree: userData.degree,
          hourly_rate: parseFloat(userData.hourlyRate),
        });
        
        // Upload educator documents if provided
        if (educatorDocs.degreeCertificate || educatorDocs.idVerification) {
          await profileService.uploadEducatorDocuments(
            educatorDocs.degreeCertificate || undefined,
            educatorDocs.idVerification || undefined
          );
        }
      }
      
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }
  
  if (!user) {
    return null; // This should not happen as the page is protected
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Profile header with avatar */}
        <div className="bg-primary-600 text-white p-6">
          <div className="flex items-center">
            <div className="mr-4">
              {user.profile_picture ? (
                <img 
                  src={user.profile_picture} 
                  alt={`${user.first_name} ${user.last_name}`}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white" 
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-400 flex items-center justify-center text-2xl font-bold">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
              <p className="text-primary-100">{user.user_type === 'student' ? 'Student' : 'Educator'}</p>
              {user.user_type === 'educator' && educatorProfile && (
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    educatorProfile.verification_status === 'verified' 
                      ? 'bg-green-500' 
                      : educatorProfile.verification_status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}>
                    {educatorProfile.verification_status.charAt(0).toUpperCase() + educatorProfile.verification_status.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={userData.firstName}
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
                value={userData.lastName}
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
              value={userData.email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={userData.bio}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
              Profile Picture
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              onChange={handleProfilePictureChange}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          
          {/* Educator-specific fields */}
          {user.user_type === 'educator' && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Educator Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                    Highest Degree
                  </label>
                  <input
                    type="text"
                    id="degree"
                    name="degree"
                    value={userData.degree || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                    Hourly Rate (USD)
                  </label>
                  <input
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    min="1"
                    step="0.01"
                    value={userData.hourlyRate || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="degreeCertificate" className="block text-sm font-medium text-gray-700">
                  Update Degree Certificate
                </label>
                <input
                  type="file"
                  id="degreeCertificate"
                  name="degreeCertificate"
                  onChange={handleEducatorDocChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              
              <div className="mt-4">
                <label htmlFor="idVerification" className="block text-sm font-medium text-gray-700">
                  Update ID Verification
                </label>
                <input
                  type="file"
                  id="idVerification"
                  name="idVerification"
                  onChange={handleEducatorDocChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>
          )}
          
          {/* Student-specific fields (subject preferences) */}
          {user.user_type === 'student' && studentProfile && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Favorite Subjects</h3>
              {studentProfile.favorite_subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {studentProfile.favorite_subjects.map((subjectId) => (
                    <span 
                      key={subjectId}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      Subject {subjectId}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No favorite subjects yet.</p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                You can add favorite subjects from the subjects page.
              </p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;