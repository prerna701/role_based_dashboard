export type CourseSeed = {
  id: string;
  title: string;
  category: string;
  level: string;
  instructor: string;
  duration_weeks: number;
};

export type EnrollmentSeed = {
  course_id: string;
  enrolled_on: string;
  completion_status: string;
  grade: string | null;
  rating: number;
  fee_paid: number;
};

export type StudentSeed = {
  id: string;
  name: string;
  region: string;
  joined_on: string;
  enrollments: EnrollmentSeed[];
};

export type AssessmentSeed = {
  students: StudentSeed[];
  courses: CourseSeed[];
};

export type AssessmentUserSeed = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
  regionCode: string | null;
};
