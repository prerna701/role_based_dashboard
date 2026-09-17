'use client';

import { Search } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/dashboard/empty-state';
import { formatCurrency } from '@/lib/dashboard-data';
import type { PopularCourse } from '@/types/analytics';

type CourseTableProps = {
  courses: PopularCourse[];
  categories: string[];
  query: string;
  categoryFilter: string;
  onQueryChange: (query: string) => void;
  onCategoryFilterChange: (category: string) => void;
};

export function CourseTable({
  courses,
  categories,
  query,
  categoryFilter,
  onQueryChange,
  onCategoryFilterChange,
}: CourseTableProps) {
  return (
    <>
      <div className="table-tools">
        <label>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search courses..."
          />
        </label>
        <select
          value={categoryFilter}
          onChange={(event) => onCategoryFilterChange(event.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <DataTable>
        <thead>
          <tr>
            <th>Rank & Course Title</th>
            <th>Category</th>
            <th>Enrollments</th>
            <th>Avg Rating</th>
            <th>Total Fees</th>
            <th>Completion</th>
          </tr>
        </thead>
        <tbody>
          {courses.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <EmptyState message="No courses match the current filters." />
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr key={course.code}>
                <td>
                  <div className="course-title">
                    <span>{course.rank}</span>
                    <div>
                      <strong>{course.title}</strong>
                      <small>{course.code}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{course.category}</span>
                </td>
                <td>{course.enrollments}</td>
                <td>{course.rating}</td>
                <td>{formatCurrency(course.fees)}</td>
                <td>
                  <div className="completion-cell">
                    <span>
                      <i style={{ width: `${course.completionRate}%` }} />
                    </span>
                    <b>{course.completionRate}%</b>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </DataTable>
    </>
  );
}
