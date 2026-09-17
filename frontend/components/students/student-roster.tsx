'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { LoadingState } from '@/components/dashboard/loading-state';
import { StudentCourseTable } from './student-course-table';
import type { StudentsPage } from '@/types/analytics';

type StudentRosterProps = {
  studentsPage: StudentsPage | null;
  search: string;
  page: number;
  scopeLabel: string;
  loading: boolean;
  error: string | null;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
};

export function StudentRoster({
  studentsPage,
  search,
  page,
  scopeLabel,
  loading,
  error,
  onSearchChange,
  onPageChange,
}: StudentRosterProps) {
  return (
    <Card className="table-card" title="Student roster" eyebrow="Paginated enrollment details">
      <div className="table-tools">
        <label>
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
              onPageChange(1);
            }}
            placeholder="Search student name or ID..."
          />
        </label>
        <span className="api-pill">{scopeLabel}</span>
      </div>

      {loading ? (
        <LoadingState message="Loading students from the backend..." />
      ) : error ? (
        <EmptyState message={error} />
      ) : studentsPage?.data.length === 0 ? (
        <EmptyState message="No students match this search." />
      ) : (
        <div className="student-list">
          {studentsPage?.data.map((student) => (
            <article className="student-card" key={student.studentId}>
              <div className="student-card-heading">
                <div>
                  <h2>{student.name}</h2>
                  <span>
                    {student.studentId} | Joined {student.joinedOn}
                  </span>
                </div>
                <div className="student-card-summary">
                  <strong>{student.courses.length} courses</strong>
                  <span>{student.completion.completed} completed</span>
                </div>
              </div>
              <StudentCourseTable
                studentId={student.studentId}
                courses={student.courses}
              />
            </article>
          ))}
        </div>
      )}

      {studentsPage && studentsPage.meta.totalPages > 1 && (
        <div className="pagination">
          <Button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            variant="secondary"
          >
            Previous
          </Button>
          <span>
            Page {page} of {studentsPage.meta.totalPages}
          </span>
          <Button
            disabled={page >= studentsPage.meta.totalPages}
            onClick={() => onPageChange(page + 1)}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
}
