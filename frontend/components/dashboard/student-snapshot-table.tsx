import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EmptyState } from './empty-state';
import { formatDisplayDate, getCourseEndDate } from '@/lib/formatters';
import type { StudentDetails } from '@/types/analytics';

type StudentSnapshotTableProps = {
  students: StudentDetails[];
};

export function StudentSnapshotTable({ students }: StudentSnapshotTableProps) {
  return (
    <Card
      className="table-card student-preview-card"
      title="Student Enrollment Snapshot"
      eyebrow=" Data"
    >
      {students.length === 0 ? (
        <EmptyState message="No students were returned for this scope." />
      ) : (
        <DataTable className="student-snapshot-table" minWidth={980}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Courses Enrolled</th>
              <th>Starting Date</th>
              <th>Ending Date</th>
              <th>Completion</th>
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 10).map((student) => {
              const sortedCourses = [...student.courses].sort(
                (left, right) =>
                  new Date(left.enrolledOn).getTime() -
                  new Date(right.enrolledOn).getTime(),
              );
              const firstCourse = sortedCourses[0];
              const finalCourse = sortedCourses.reduce<Date | null>(
                (latestDate, course) => {
                  const endDate = getCourseEndDate(
                    course.enrolledOn,
                    course.durationWeeks,
                  );

                  return !latestDate || endDate > latestDate
                    ? endDate
                    : latestDate;
                },
                null,
              );

              return (
                <tr key={student.studentId}>
                  <td>
                    <div className="student-table-name">
                      <strong>{student.name}</strong>
                      <small>{student.studentId}</small>
                    </div>
                  </td>
                  <td>{student.courses.length}</td>
                  <td>{formatDisplayDate(firstCourse?.enrolledOn)}</td>
                  <td>{finalCourse ? formatDisplayDate(finalCourse.toISOString()) : 'Not available'}</td>
                  <td>
                    <div className="completion-summary table-completion-summary">
                      <span className="status-completed">{student.completion.completed} done</span>
                      <span className="status-progress">{student.completion.inProgress} active</span>
                      <span className="status-dropped">{student.completion.dropped} dropped</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      )}
      <div className="card-footer-action">
        <Button href="/students" variant="secondary">
          Read more <ArrowRight size={15} />
        </Button>
      </div>
    </Card>
  );
}
