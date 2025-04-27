import { Educator, Student, User } from '../../types/common/models';
import { ApiService } from '../common/api.service';

export class ProfileService extends ApiService {
  // Get student profile
  public async getStudentProfile(): Promise<Student> {
    return this.get<Student>('/users/profile/student/');
  }
  
  // Get educator profile
  public async getEducatorProfile(): Promise<Educator> {
    return this.get<Educator>('/users/profile/educator/');
  }
  
  // Update user profile
  public async updateUserProfile(userData: Partial<User>): Promise<User> {
    return this.put<User>('/users/profile/', userData);
  }
  
  // Update student profile
  public async updateStudentProfile(studentData: Partial<Student>): Promise<Student> {
    return this.put<Student>('/users/profile/student/', studentData);
  }
  
  // Update educator profile
  public async updateEducatorProfile(educatorData: Partial<Educator>): Promise<Educator> {
    return this.put<Educator>('/users/profile/educator/', educatorData);
  }
  
  // Upload profile picture
  public async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    return this.post<User>('/users/profile/picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  
  // Upload educator documents
  public async uploadEducatorDocuments(degreeCertificate?: File, idVerification?: File): Promise<Educator> {
    const formData = new FormData();
    
    if (degreeCertificate) {
      formData.append('degree_certificate', degreeCertificate);
    }
    
    if (idVerification) {
      formData.append('id_verification', idVerification);
    }
    
    return this.post<Educator>('/users/profile/educator/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}