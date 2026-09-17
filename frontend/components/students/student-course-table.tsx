import { DataTable } from '@/components/ui/data-table';
import { formatCurrency } from '@/lib/dashboard-data';
import {
  formatDisplayDate,
  getCourseEndDateLabel,
  getEnrollmentStatusLabel,
} from '@/lib/formatters';
import type { StudentCourse } from '@/types/analytics';

import type { StudentCourseTableProps } from '@/types/components';
export function StudentCourseTable({
  studentId,
  courses,
}: StudentCourseTableProps) {
  return (
    <DataTable className="student-course-table" minWidth={1080}>
      <thead>
        <tr>
          <th>Course Name</th>
          <th>Category</th>
          <th>Level</th>
          <th>Instructor</th>
          <th>Starting Date</th>
          <th>Ending Date</th>
          <th>Progress</th>
          <th>Grade</th>
          <th>Rating</th>
          <th>Fee Paid</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => (
          <tr key={`${studentId}-${course.courseId}`}>
            <td>
              <div className="course-title compact-course-title">
                <div>
                  <strong>{course.title}</strong>
                  <small>
                    {course.courseId} | {course.durationWeeks} weeks
                  </small>
                </div>
              </div>
            </td>
            <td>
              <span className="category-badge">{course.category}</span>
            </td>
            <td>{course.level}</td>
            <td>{course.instructor}</td>
            <td>{formatDisplayDate(course.enrolledOn)}</td>
            <td>{getCourseEndDateLabel(course.enrolledOn, course.durationWeeks)}</td>
            <td>
              <span className={`status-pill status-${course.completionStatus}`}>
                {getEnrollmentStatusLabel(course.completionStatus)}
              </span>
            </td>
            <td>{course.grade ?? 'No grade'}</td>
            <td>{course.rating.toFixed(1)}</td>
            <td>{formatCurrency(course.feePaid)}</td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
