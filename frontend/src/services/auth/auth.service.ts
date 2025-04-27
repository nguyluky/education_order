import { User } from '../../types/common/models';
import { ApiService } from '../common/api.service';

// Auth response interfaces
interface LoginResponse {
  token: string;
  user_id: number;
  email: string;
  user_type: string;
}

interface RegisterResponse extends LoginResponse {}

// Request interfaces
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  user_type: 'student';
  profile_picture?: File;
  bio?: string;
}

interface EducatorRegisterRequest {
  user: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    confirm_password: string;
    profile_picture?: File;
    bio?: string;
  };
  degree: string;
  degree_certificate: File;
  id_verification: File;
  hourly_rate: number;
}

export class AuthService extends ApiService {
  // Login user
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/users/login/', credentials);
  }

  // Register as student
  public async registerStudent(userData: RegisterRequest): Promise<RegisterResponse> {
    // Create a FormData object to handle file uploads

    // const converFileToBase64 = (file: File): Promise<string> => {
    //   return new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.onload = () => resolve(reader.result as string);
    //     reader.onerror = (error) => reject(error);
    //     reader.readAsDataURL(file);
    //   });
    // }

    const formData = new FormData();

    for (const [key, value] of Object.entries(userData)) {
        if (value instanceof File) {
            
          formData.append(key, value);
        }
        
        else {
          formData.append(key, value?.toString());
        }
    }
    // Object.entries(userData).forEach(([key, value]) => {
    //   if (value instanceof File) {
    //     formData.append(key, await converFileToBase64(value));
    //   } else {
    //     formData.append(key, value?.toString() || '');
    //   }
    // });

    return this.post<RegisterResponse>('/users/register/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
  }

  // Register as educator
  public async registerEducator(userData: EducatorRegisterRequest): Promise<RegisterResponse> {
    // Create a FormData object to handle file uploads
    const formData = new FormData();
    
    // Append user data
    Object.entries(userData.user).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(`user.${key}`, value);
      } else {
        formData.append(`user.${key}`, value?.toString() || '');
      }
    });
    
    // Append educator-specific data
    formData.append('degree', userData.degree);
    formData.append('degree_certificate', userData.degree_certificate);
    formData.append('id_verification', userData.id_verification);
    formData.append('hourly_rate', userData.hourly_rate.toString());

    return this.post<RegisterResponse>('/users/register/educator/', formData);
  }

  // Logout user
  public async logout(): Promise<void> {
    await this.post<void>('/users/logout/');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user profile
  public async getCurrentUser(): Promise<User> {
    return this.get<User>('/users/profile/');
  }

  // Update user profile
  public async updateUserProfile(userData: Partial<User>): Promise<User> {
    return this.put<User>('/users/profile/', userData);
  }
}