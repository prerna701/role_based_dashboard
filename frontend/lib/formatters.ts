export const enrollmentStatusLabels = {
  completed: 'Completed',
  in_progress: 'In Progress',
  dropped: 'Dropped',
} as const;

export type EnrollmentStatus = keyof typeof enrollmentStatusLabels;

export function formatDisplayDate(value?: string): string {
  if (!value) {
    return 'Not started';
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function getCourseEndDate(
  enrolledOn: string,
  durationWeeks: number,
): Date {
  const endDate = new Date(enrolledOn);
  endDate.setDate(endDate.getDate() + durationWeeks * 7);

  return endDate;
}

export function getCourseEndDateLabel(
  enrolledOn: string,
  durationWeeks: number,
): string {
  return formatDisplayDate(getCourseEndDate(enrolledOn, durationWeeks).toISOString());
}

export function getEnrollmentStatusLabel(status: string): string {
  return enrollmentStatusLabels[status as EnrollmentStatus] ?? status;
}
