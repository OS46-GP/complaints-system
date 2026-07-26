import { ComplaintCreateForm } from "@/components/complaint-create-form";
import type { ComplaintCreateFormData } from "@/types/complaint-create.types";

export default function AdminNewComplaint() {
  const handleSubmit = async (data: ComplaintCreateFormData) => {
    console.log("Admin submitting complaint:", data);
  };

  return (
    <section className="p-0 md:p-stack-lg flex flex-col items-center flex-grow">
      <ComplaintCreateForm onSubmit={handleSubmit} />
    </section>
  );
}
