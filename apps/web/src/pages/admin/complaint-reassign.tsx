import { useParams } from "react-router";
import { ComplaintReassignForm } from "@/features/complaint-reassign/complaint-reassign-form";

export default function AdminComplaintReassign() {
  const { id } = useParams();
  return (
    <section className="p-0 md:p-stack-lg flex flex-col items-center flex-grow">
      <ComplaintReassignForm complaintId={id!} />
    </section>
  );
}