export type UserRole = "worker" | "employer" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePhoto?: string;
  language: string;
  createdAt: string;
}

export interface WorkerProfile extends User {
  role: "worker";
  skills: string[];
  location: string;
  hourlyRate: number;
  dailyRate: number;
  bio: string;
  workPhotos: string[];
  rating: number;
  completedJobs: number;
  streak: number;
  level: "bronze" | "silver" | "gold";
  totalEarnings: number;
  verified: boolean;
}

export interface EmployerProfile extends User {
  role: "employer";
  companyName: string;
  location: string;
  projectsPosted: number;
  rating: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  employerId: string;
  employerName: string;
  employerPhoto?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  payAmount: number;
  payType: "hourly" | "daily" | "fixed";
  duration: string;
  requiredSkills: string[];
  status: "open" | "in-progress" | "completed" | "cancelled";
  teamRequired: boolean;
  teamSize?: number;
  postedDate: string;
  startDate: string;
  endDate?: string;
  verified: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  status: "pending" | "accepted" | "rejected";
  appliedDate: string;
  teamMembers?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  jobId: string;
  color?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Payment {
  id: string;
  jobId: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  dueDate: string;
  paidDate?: string;
}
