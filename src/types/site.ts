export type CourseIcon =
  | "layers"
  | "brain"
  | "network"
  | "terminal"
  | "code"
  | "server";

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  icon: CourseIcon;
  tag: string;
}

export interface LatestCourse {
  title: string;
  description: string;
  stack: string[];
  level: string;
  duration: string;
}

export interface PublicCoursesData {
  courses: Course[];
  latestCourse: LatestCourse | null;
}
