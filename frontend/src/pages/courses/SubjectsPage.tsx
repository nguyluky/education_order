import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { SubjectService } from '../../services/courses/subject.service';
import { Subject } from '../../types/common/models';

const subjectService = new SubjectService();

const SubjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [favoriteSubjects, setFavoriteSubjects] = useState<Set<number>>(new Set());

  // Fetch all subjects and student's favorite subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const allSubjects = await subjectService.getAllSubjects();
        setSubjects(allSubjects);
        
        // If user is a student, get their favorite subjects
        if (user?.user_type === 'student') {
          try {
            const favoriteIds = allSubjects
              .filter(subject => subject.is_favorite) // Assuming backend adds this property for students
              .map(subject => subject.id);
            
            setFavoriteSubjects(new Set(favoriteIds));
          } catch (err) {
            console.error('Error getting favorite subjects', err);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, [user]);

  // Handle adding/removing subject from favorites
  const handleFavoriteToggle = async (subjectId: number) => {
    if (!user || user.user_type !== 'student') {
      return;
    }
    
    try {
      if (favoriteSubjects.has(subjectId)) {
        await subjectService.removeFromFavorites(subjectId);
        setFavoriteSubjects(prev => {
          const updated = new Set(prev);
          updated.delete(subjectId);
          return updated;
        });
      } else {
        await subjectService.addToFavorites(subjectId);
        setFavoriteSubjects(prev => {
          const updated = new Set(prev);
          updated.add(subjectId);
          return updated;
        });
      }
    } catch (err: any) {
      console.error('Error toggling favorite subject:', err);
    }
  };

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Subjects</h1>
      
      {/* Search box */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      {/* Subject grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold mb-2">{subject.name}</h2>
                  
                  {user?.user_type === 'student' && (
                    <button
                      onClick={() => handleFavoriteToggle(subject.id)}
                      className="text-gray-400 hover:text-primary-500 focus:outline-none"
                      aria-label={favoriteSubjects.has(subject.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favoriteSubjects.has(subject.id) ? (
                        <svg className="h-6 w-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{subject.description}</p>
                
                <Link
                  to={`/subjects/${subject.id}`}
                  className="block w-full text-center py-2 px-4 bg-primary-500  rounded-md hover:bg-primary-600 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No subjects found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsPage;