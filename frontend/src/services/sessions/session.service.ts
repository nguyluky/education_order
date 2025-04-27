import { Session, SessionDetail, SessionRequest } from '../../types/common/models';
import { ApiService } from '../common/api.service';

export class SessionService extends ApiService {
  // Get all sessions for current user
  public async getMySessions(status?: string): Promise<Session[]> {
    return this.get<Session[]>('/sessions/my-sessions/', { params: { status } });
  }
  
  // Get session detail by ID
  public async getSessionDetail(id: number): Promise<SessionDetail> {
    return this.get<SessionDetail>(`/sessions/${id}/`);
  }
  
  // Create a new session request (student sends to educator)
  public async createSessionRequest(data: SessionRequest): Promise<Session> {
    return this.post<Session>('/sessions/request/', data);
  }
  
  // Accept a session request (educator accepts student's request)
  public async acceptSession(id: number): Promise<Session> {
    return this.post<Session>(`/sessions/${id}/accept/`);
  }
  
  // Reject a session request (educator rejects student's request)
  public async rejectSession(id: number, reason: string): Promise<Session> {
    return this.post<Session>(`/sessions/${id}/reject/`, { reason });
  }
  
  // Cancel a session (can be done by student or educator)
  public async cancelSession(id: number, reason: string): Promise<Session> {
    return this.post<Session>(`/sessions/${id}/cancel/`, { reason });
  }
  
  // Complete a session (educator marks session as completed)
  public async completeSession(id: number): Promise<Session> {
    return this.post<Session>(`/sessions/${id}/complete/`);
  }
  
  // Rate a completed session (student rates the session)
  public async rateSession(id: number, rating: number, feedback: string): Promise<Session> {
    return this.post<Session>(`/sessions/${id}/rate/`, { rating, feedback });
  }
}