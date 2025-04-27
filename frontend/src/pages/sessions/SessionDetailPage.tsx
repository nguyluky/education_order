// import { ExternalLinkIcon, LinkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { SessionService } from '../../services/sessions/session.service';
import { SessionDetail } from '../../types/common/models';

const sessionService = new SessionService();

const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // For action modals
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [actionReason, setActionReason] = useState<string>('');

  useEffect(() => {
    const fetchSessionDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const sessionData = await sessionService.getSessionDetail(parseInt(id));
        setSession(sessionData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load session details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionDetail();
  }, [id]);

  // Handle session actions
  const handleSessionAction = async (action: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      switch(action) {
        case 'accept':
          await sessionService.acceptSession(parseInt(id));
          break;
        case 'reject':
          await sessionService.rejectSession(parseInt(id), actionReason);
          setShowRejectModal(false);
          break;
        case 'cancel':
          await sessionService.cancelSession(parseInt(id), actionReason);
          setShowCancelModal(false);
          break;
        case 'complete':
          await sessionService.completeSession(parseInt(id));
          break;
        default:
          break;
      }
      
      // Refresh session data
      const updatedSession = await sessionService.getSessionDetail(parseInt(id));
      setSession(updatedSession);
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${action} session`);
    } finally {
      setLoading(false);
      setActionReason('');
    }
  };

  // Format date string to readable format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time string to readable format
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format full date and time
  const formatFullDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Calculate duration from start and end time
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let result = '';
    if (durationHours > 0) {
      result += `${durationHours} hour${durationHours > 1 ? 's' : ''}`;
    }
    if (durationMinutes > 0) {
      if (result) result += ' ';
      result += `${durationMinutes} minute${durationMinutes > 1 ? 's' : ''}`;
    }
    return result;
  };

  if (loading && !session) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/sessions')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Session not found</h3>
          <p className="text-gray-500 mb-4">The session you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/sessions')}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/sessions')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sessions
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Session header */}
        <div className="bg-primary-50 p-6 border-b border-primary-100">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {user?.user_type === 'student' 
                  ? `Session with ${session.educator_name || 'Educator'}` 
                  : `Session with ${session.student_name || 'Student'}`}
              </h1>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Subject:</span> {session.subject_name || session.subject.name}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Created:</span> {formatFullDateTime(session.created_at)}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                session.status === 'scheduled' 
                  ? 'bg-blue-100 text-blue-800' 
                  : session.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : session.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </div>
              
              {session.status === 'completed' && session.rating !== undefined && (
                <div className="mt-2 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`h-5 w-5 ${i < (session.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{session.rating}/5</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Session details */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Session Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Date:</span> {formatDate(session.start_time)}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Time:</span> {formatTime(session.start_time)} - {formatTime(session.end_time)}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Duration:</span> {session.duration_minutes} minutes
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Price:</span> ${session.price || session.session_cost}
              </p>
            </div>
            <div>
              {session.video_link && (
                <div className="mb-2">
                  <span className="font-medium text-gray-600">Session Recording:</span>
                  <div className="mt-2">
                    <a 
                      href={session.video_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      {/* <ExternalLinkIcon className="h-4 w-4 mr-1" /> */}
                      {session.video_link.length > 40 
                        ? `${session.video_link.substring(0, 40)}...` 
                        : session.video_link}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Topics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Topics</h2>
          <p className="text-gray-700">
            {session.topics || "No topics specified for this session."}
          </p>
        </div>
        
        {/* Additional details */}
        {session.student_notes && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Notes</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">{session.student_notes}</p>
            </div>
          </div>
        )}
        
        {session.educator_notes && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Educator Notes</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">{session.educator_notes}</p>
            </div>
          </div>
        )}
        
        {/* Status history */}
        {session.status_history && session.status_history.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status History</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
              <div className="space-y-6 relative">
                {session.status_history.map((history, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 border-2 border-primary-500 z-10 mr-4">
                      <svg className="h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        {history.reason && ` - ${history.reason}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFullDateTime(history.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Feedback and rating */}
        {session.status === 'completed' && session.feedback && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Feedback</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`h-5 w-5 ${i < (session.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 font-medium">{session.rating}/5</span>
              </div>
              <p className="text-gray-700">{session.feedback}</p>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            {/* Student actions */}
            {user?.user_type === 'student' && session.status === 'completed' && !session.rating && (
              <Link
                to={`/sessions/${session.id}/rate`}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Rate Session
              </Link>
            )}
            
            {user?.user_type === 'student' && session.status === 'scheduled' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel Session
              </button>
            )}
            
            {/* Educator actions */}
            {user?.user_type === 'educator' && session.status === 'pending' && (
              <>
                <button
                  onClick={() => handleSessionAction('accept')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Accept Request
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reject Request
                </button>
              </>
            )}
            
            {user?.user_type === 'educator' && session.status === 'scheduled' && (
              <>
                <button
                  onClick={() => handleSessionAction('complete')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel Session
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cancel Session</h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to cancel this session? Please provide a reason:
              </p>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-4"
                rows={3}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setActionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSessionAction('cancel')}
                  disabled={!actionReason.trim()}
                  className={`px-4 py-2 ${
                    actionReason.trim() 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-red-300 text-white cursor-not-allowed'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  {loading ? 'Processing...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Session Request</h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to reject this session request? Please provide a reason:
              </p>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-4"
                rows={3}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setActionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSessionAction('reject')}
                  disabled={!actionReason.trim()}
                  className={`px-4 py-2 ${
                    actionReason.trim() 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-red-300 text-white cursor-not-allowed'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  {loading ? 'Processing...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetailPage;