import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { SessionService } from '../../services/sessions/session.service';
import { SessionDetail } from '../../types/common/models';

const sessionService = new SessionService();

const SessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upcoming');

  // Fetch sessions based on active tab
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const statusMap: Record<string, string | undefined> = {
          upcoming: 'scheduled',
          pending: 'pending',
          completed: 'completed',
          cancelled: 'cancelled'
        };
        
        const sessionsData = await sessionService.getMySessions(statusMap[activeTab]);
        setSessions(sessionsData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [activeTab]);

  // Handle session actions based on user type and session status
  const handleSessionAction = async (action: string, sessionId: number, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      switch(action) {
        case 'accept':
          await sessionService.acceptSession(sessionId);
          break;
        case 'reject':
          if (!reason) return;
          await sessionService.rejectSession(sessionId, reason);
          break;
        case 'cancel':
          if (!reason) return;
          await sessionService.cancelSession(sessionId, reason);
          break;
        case 'complete':
          await sessionService.completeSession(sessionId);
          break;
        default:
          break;
      }
      
      // Refresh sessions after action
      const statusMap: Record<string, string | undefined> = {
        upcoming: 'scheduled',
        pending: 'pending',
        completed: 'completed',
        cancelled: 'cancelled'
      };
      
      const updatedSessions = await sessionService.getMySessions(statusMap[activeTab]);
      setSessions(updatedSessions);
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${action} session`);
    } finally {
      setLoading(false);
    }
  };

  // Format date string to readable format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
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
  
  // Calculate duration from start and end time
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (durationHours > 0) {
      return `${durationHours}h${durationMinutes > 0 ? ` ${durationMinutes}m` : ''}`;
    }
    return `${durationMinutes}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Sessions</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Session tabs */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'upcoming' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'pending' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'completed' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'cancelled' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-xl font-bold mb-2">
                      {user?.user_type === 'student' 
                        ? `Session with ${session.educator_name}` 
                        : `Session with ${session.student_name}`}
                    </h2>
                    <p className="text-gray-600">
                      <span className="font-medium">Subject:</span> {session.subject_name}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                    {session.status === 'completed' && session.rating && (
                      <div className="mt-1 flex items-center">
                        <span className="text-yellow-500 mr-1">
                          {/* Star icon */}
                          ★
                        </span>
                        <span className="text-sm font-medium">{session.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(session.start_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {calculateDuration(session.start_time, session.end_time)}
                    </p>
                  </div>
                </div>
                
                {/* Action buttons based on user role and session status */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/sessions/${session.id}`}
                    className="px-4 py-2 border border-primary-500 text-primary-600 rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    View Details
                  </Link>
                  
                  {/* Student actions */}
                  {user?.user_type === 'student' && session.status === 'completed' && !session.rating && (
                    <Link
                      to={`/sessions/${session.id}/rate`}
                      className="px-4 py-2 bg-primary-500  rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Rate Session
                    </Link>
                  )}
                  
                  {user?.user_type === 'student' && session.status === 'scheduled' && (
                    <button
                      onClick={() => handleSessionAction('cancel', session.id, 'Student canceled the session')}
                      className="px-4 py-2 bg-red-500  rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel Session
                    </button>
                  )}
                  
                  {/* Educator actions */}
                  {user?.user_type === 'educator' && session.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleSessionAction('accept', session.id)}
                        className="px-4 py-2 bg-green-500  rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => handleSessionAction('reject', session.id, 'Educator is not available')}
                        className="px-4 py-2 bg-red-500  rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reject Request
                      </button>
                    </>
                  )}
                  
                  {user?.user_type === 'educator' && session.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleSessionAction('complete', session.id)}
                        className="px-4 py-2 bg-green-500  rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Mark as Completed
                      </button>
                      <button
                        onClick={() => handleSessionAction('cancel', session.id, 'Educator canceled the session')}
                        className="px-4 py-2 bg-red-500  rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel Session
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'upcoming' 
              ? 'No upcoming sessions' 
              : activeTab === 'pending' 
              ? 'No pending sessions' 
              : activeTab === 'completed'
              ? 'No completed sessions'
              : 'No cancelled sessions'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'upcoming' || activeTab === 'pending' 
              ? user?.user_type === 'student' 
                ? 'Book a session with an educator to get started.' 
                : 'Wait for students to book sessions with you.'
              : 'Your sessions will appear here when completed.'
            }
          </p>
          
          {user?.user_type === 'student' && (activeTab === 'upcoming' || activeTab === 'pending') && (
            <Link
              to="/educators"
              className="px-4 py-2 bg-primary-500  rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Find Educators
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;