import { AppShell } from "@/components/app-shell";
import { AssignmentDetail } from "@/components/assignments/assignment-detail";

export default async function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><AssignmentDetail assignmentId={id} /></AppShell>;
}
