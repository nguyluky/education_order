import { Subject, SubjectDetail } from '../../types/common/models';
import { ApiService } from '../common/api.service';

export class SubjectService extends ApiService {
  // Get all subjects
  public async getAllSubjects(): Promise<Subject[]> {
    return this.get<Subject[]>('/courses/subjects/');
  }
  
  // Get subject detail
  public async getSubjectDetail(id: number): Promise<SubjectDetail> {
    return this.get<SubjectDetail>(`/courses/subjects/${id}/`);
  }
  
  // Add subject to favorites
  public async addToFavorites(id: number): Promise<void> {
    return this.post<void>(`/courses/subjects/${id}/favorite/`);
  }
  
  // Remove subject from favorites
  public async removeFromFavorites(id: number): Promise<void> {
    return this.delete<void>(`/courses/subjects/${id}/favorite/`);
  }
}