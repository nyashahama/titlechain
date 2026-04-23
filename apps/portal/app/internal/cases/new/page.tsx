import Link from "next/link";
import { listAnalysts } from "./api";
import { CaseIntakeForm } from "./_components/case-intake-form";

export default async function NewCasePage() {
  const analysts = await listAnalysts();
  const defaultActorId = analysts[0]?.id ?? "";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link href="/internal/cases" className="text-sm text-indigo-600 hover:text-indigo-500">
          &larr; Back to queue
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Case</h1>
      </div>

      <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
        <CaseIntakeForm actorId={defaultActorId} />
      </div>
    </div>
  );
}
