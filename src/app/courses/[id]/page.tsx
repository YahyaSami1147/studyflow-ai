import { AppShell } from "@/components/app-shell";
import { CourseDetail } from "@/components/courses/course-detail";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><CourseDetail courseId={id} /></AppShell>;
}
