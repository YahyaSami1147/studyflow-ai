import { PlaceholderPage } from "@/components/placeholder-page";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaceholderPage title={`Course ${id}`} description="A future course overview with materials, deadlines, and progress." eyebrow="Course detail" />;
}
