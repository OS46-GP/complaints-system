import { useParams } from "react-router";
import { ComplaintResponseForm } from "@/features/complaint-response/complaint-response-form";

export default function UserComplaintResponse() {
  const { id } = useParams();
  return (
    <section className="p-0 md:p-stack-lg flex flex-col items-center flex-grow">
      <ComplaintResponseForm complaintId={id!} />
    </section>
  );
}
