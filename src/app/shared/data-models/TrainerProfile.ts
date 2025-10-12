export interface TrainerProfile {
  id?: string;
  employeeId: string;
  firstname?: string;
  lastname?: string;
  image?: string;
  coverImage?: string;
  headline?: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  hourlyRate?: string;
  availability?: string;
  certifications?: string[];
  rating?: number;
  totalReviews?: number;
  trainerVideoIntro?: string;
  website?: string;
  linkedIn?: string;
  youtube?: string;
  isPublicProfile?: boolean;
}
