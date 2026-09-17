# Database Plan

## Shape

The source JSON has students with nested enrollments and course details. The
database stores that as relational facts:

- `regions(code, name)`
- `students(id, external_id, name, region_code, joined_on)`
- `categories(id, name)`
- `instructors(id, name)`
- `courses(id, external_id, title, category_id, instructor_id, level, duration_weeks)`
- `enrollments(id, student_id, course_id, enrolled_on, completion_status, grade, rating, fee_paid)`

`fee_paid` belongs to `enrollments`, not `courses`, because the same course can
have different paid fees across students.

## Join Spine

All analytics should follow one spine:

`enrollments -> students -> regions`

and

`enrollments -> courses -> categories / instructors`

The `enrollment_facts` view stores this join path so later dashboard queries can
reuse it instead of re-writing access-control-sensitive joins.

## Indexes

- `students(region_code)` supports role scope and region filters.
- `courses(category_id)` supports revenue grouped by course category.
- `courses(instructor_id)` supports instructor-level insights.
- `enrollments(course_id)` supports enrollment-to-course joins.
- `enrollments(enrolled_on)` supports future monthly trend widgets.
- `UNIQUE(student_id, course_id)` prevents duplicate enrollments for this seed.

No covering revenue index is added yet because this dataset is small. The first
large-data optimization would be an aggregate-friendly covering index or a
materialized analytics table after measuring real query plans.

## Scope Foundation

`user.regionCode` is nullable and references `regions(code)`.

The database check constraint ensures:

- Admin users are not tied to one region.
- Region manager users must have a region.

Later GET APIs should be paginated by default. Analytics endpoints that return
chart buckets can still return bounded arrays, but any row-list endpoint should
use the existing pagination response pattern.
