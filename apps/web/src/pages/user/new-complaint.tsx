import { ComplaintCreateForm } from "@/features/complaint-create/complaint-create-form";
import type { ComplaintCreateFormData } from "@/features/complaint-create/types";

export default function UserNewComplaint() {
  const handleSubmit = async (data: ComplaintCreateFormData) => {
    console.log("Submitting complaint:", data);
  };

  return (
    <section className="p-0 md:p-stack-lg flex flex-col items-center flex-grow">
      <ComplaintCreateForm onSubmit={handleSubmit} />
    </section>
  );
}
