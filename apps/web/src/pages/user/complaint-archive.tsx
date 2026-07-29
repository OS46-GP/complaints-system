import { useParams } from "react-router";
import { ComplaintArchiveForm } from "@/features/complaint-archive/complaint-archive-form";

export default function UserComplaintArchive() {
  const { id } = useParams();
  return (
    <section className="p-0 md:p-stack-lg flex flex-col items-center flex-grow">
      <ComplaintArchiveForm complaintId={id!} />
    </section>
  );
}
