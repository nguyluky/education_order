import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SubjectService } from '../../services/courses/subject.service';
import { EducatorService } from '../../services/educators/educator.service';
import { Educator, Subject } from '../../types/common/models';

const educatorService = new EducatorService();
const subjectService = new SubjectService();

const EducatorsPage: React.FC = () => {
  const [educators, setEducators] = useState<Educator[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [rateRange, setRateRange] = useState<{min: number, max: number}>({ min: 0, max: 100 });

  // Fetch educators and subjects on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all subjects for filter dropdown
        const subjectsData = await subjectService.getAllSubjects();
        setSubjects(subjectsData);
        
        // Fetch initial educators list
        const educatorsData = await educatorService.getEducators();
        setEducators(educatorsData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    const applyFilters = async () => {
      if (!loading) {
        setLoading(true);
        setError(null);
        
        try {
          const filters: {
            subject_id?: number;
            min_rate?: number;
            max_rate?: number;
            search?: string;
          } = {};
          
          if (selectedSubject) {
            filters.subject_id = selectedSubject;
          }
          
          filters.min_rate = rateRange.min;
          filters.max_rate = rateRange.max;
          
          if (searchTerm.trim()) {
            filters.search = searchTerm.trim();
          }
          
          const filteredEducators = await educatorService.getEducators(filters);
          setEducators(filteredEducators);
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to apply filters');
        } finally {
          setLoading(false);
        }
      }
    };
    
    const debounceTimer = setTimeout(() => {
      applyFilters();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedSubject, rateRange.min, rateRange.max]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubject(null);
    setRateRange({ min: 0, max: 100 });
  };

  // Render loading state
  if (loading && educators.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Educators</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <div className="space-y-6">
              {/* Search box */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Subject filter */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  id="subject"
                  value={selectedSubject || ''}
                  onChange={(e) => setSelectedSubject(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Rate range filter */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="minRate" className="block text-sm font-medium text-gray-700">
                    Hourly Rate Range
                  </label>
                  <span className="text-sm text-gray-500">
                    ${rateRange.min} - ${rateRange.max}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minRate" className="block text-xs text-gray-500">
                      Min ($)
                    </label>
                    <input
                      type="number"
                      id="minRate"
                      min="0"
                      value={rateRange.min}
                      onChange={(e) => setRateRange({ ...rateRange, min: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxRate" className="block text-xs text-gray-500">
                      Max ($)
                    </label>
                    <input
                      type="number"
                      id="maxRate"
                      min="0"
                      value={rateRange.max}
                      onChange={(e) => setRateRange({ ...rateRange, max: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Reset filters button */}
              <button
                onClick={resetFilters}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Educators list */}
        <div className="lg:col-span-3">
          {loading && (
            <div className="text-center mb-4 text-gray-500">
              Updating results...
            </div>
          )}
          
          {educators.length > 0 ? (
            <div className="space-y-6">
              {educators.map((educator) => (
                <div
                  key={educator.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                        {educator.user.profile_picture ? (
                          <img
                            src={educator.user.profile_picture}
                            alt={`${educator.user.first_name} ${educator.user.last_name}`}
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600">
                            {educator.user.first_name.charAt(0)}{educator.user.last_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                            <h2 className="text-xl font-bold">
                              {educator.user.first_name} {educator.user.last_name}
                            </h2>
                            <p className="text-gray-500">{educator.degree}</p>
                          </div>
                          
                          <div className="text-right mt-2 md:mt-0">
                            <p className="text-lg font-bold text-primary-600">${educator.hourly_rate}/hr</p>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {educator.verification_status === 'verified' ? 'Verified' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>
                        
                        {educator.user.bio && (
                          <p className="text-gray-600 mt-2 line-clamp-2">
                            {educator.user.bio}
                          </p>
                        )}
                        
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-1">Subjects</h3>
                          <div className="flex flex-wrap gap-2">
                            {educator.subjects.map((subjectId) => {
                              const subject = subjects.find(s => s.id === subjectId);
                              return (
                                <span
                                  key={subjectId}
                                  className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs"
                                >
                                  {subject ? subject.name : `Subject ${subjectId}`}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Link
                            to={`/educators/${educator.id}`}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No educators found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters to find educators.</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducatorsPage;