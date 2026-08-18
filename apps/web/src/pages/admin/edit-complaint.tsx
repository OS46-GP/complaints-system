import { useParams } from "react-router";
import { ComplaintEditForm } from "@/features/complaint-edit/complaint-edit-form";

export default function AdminEditComplaint() {
  const { id } = useParams();
  return (
    <section className="p-0 md:p-stack-lg flex flex-col items-center flex-grow">
      <ComplaintEditForm complaintId={id!} />
    </section>
  );
}
