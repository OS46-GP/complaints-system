import { useParams } from "react-router";
import { ComplaintUrgencyForm } from "@/features/complaint-urgency/complaint-urgency-form";

export default function AdminComplaintUrgency() {
  const { id } = useParams();
  return (
    <section className="p-0 md:p-stack-lg flex flex-col items-center flex-grow">
      <ComplaintUrgencyForm complaintId={id!} />
    </section>
  );
}