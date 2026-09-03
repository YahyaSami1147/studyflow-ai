import { PlaceholderPage } from "@/components/placeholder-page";

export default async function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaceholderPage title={`Assignment ${id}`} description="A future assignment view with instructions, dates, and status." eyebrow="Assignment detail" />;
}
