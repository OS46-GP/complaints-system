import { ComplaintCreateForm } from "@/features/complaint-create/complaint-create-form";

export default function AdminNewComplaint() {
  return (
    <section className="p-0 md:p-stack-lg flex flex-col items-center flex-grow">
      <ComplaintCreateForm />
    </section>
  );
}
