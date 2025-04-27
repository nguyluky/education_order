import { Educator } from '../../types/common/models';
import { ApiService } from '../common/api.service';

interface EducatorFilters {
  subject_id?: number;
  min_rate?: number;
  max_rate?: number;
  search?: string;
}

export class EducatorService extends ApiService {
  // Get all educators with optional filters
  public async getEducators(filters?: EducatorFilters): Promise<Educator[]> {
    return this.get<Educator[]>('/users/educators/', { params: filters });
  }
  
  // Get educator detail
  public async getEducatorDetail(id: number): Promise<Educator> {
    return this.get<Educator>(`/users/educators/${id}/`);
  }
}