// User-related types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'student' | 'educator' | 'admin';
  profile_picture: string | null;
  bio: string | null;
  date_joined: string;
  is_verified: boolean;
}

export interface Student {
  id: number;
  user: User;
  favorite_subjects: number[];
}

export interface Educator {
  id: number;
  user: User;
  degree: string;
  hourly_rate: number;
  subjects: number[];
  verification_status: 'pending' | 'verified' | 'rejected';
  contract_signed: boolean;
}

// Subject-related types
export interface Subject {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  is_favorite?: boolean;
}

export interface SubjectDetail extends Subject {
  educators: Educator[];
}

// Session-related types
export interface Session {
  id: number;
  student: Student;
  educator: Educator;
  subject: Subject;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled' | 'scheduled';
  created_at: string;
  updated_at: string;
  meeting_link: string | null;
  session_notes: string;
  duration_minutes: number;
  session_cost: number;
  review?: Review;
}

export interface SessionDetail extends Session {
  // Additional fields for detailed session view
  student_notes?: string;
  educator_notes?: string;
  materials?: string[];
  
  // Additional fields used in SessionDetailPage
  educator_name?: string;
  student_name?: string;
  subject_name?: string;
  rating?: number;
  price?: number;
  video_link?: string;
  topics?: string;
  status_history?: Array<any>; // Update this to a more specific type if possible
  feedback?: string;
}

export interface SessionRequest {
  subject_id: number;
  educator_id: number;
  start_time: string;
  end_time: string;
  session_notes: string;
}

export interface Review {
  id: number;
  session: number;
  rating: number;
  comment: string;
  created_at: string;
}

// Payment-related types
export interface Transaction {
  id: number;
  session: Session;
  student: Student;
  educator: Educator;
  amount: number;
  transaction_type: 'payment' | 'payout' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string | null;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutAccount {
  id: number;
  educator: Educator;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}