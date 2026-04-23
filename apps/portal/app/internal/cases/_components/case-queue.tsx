import Link from "next/link";
import { CaseSummary } from "../types";

function statusBadge(status: CaseSummary["status"]) {
  const map: Record<string, string> = {
    open: "bg-gray-100 text-gray-800",
    in_review: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed_unresolved: "bg-red-100 text-red-800",
    reopened: "bg-blue-100 text-blue-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

export function CaseQueue({ cases }: { cases: CaseSummary[] | null }) {
  if (!cases || cases.length === 0) {
    return <p className="text-sm text-gray-500">No cases found.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Reference
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Property
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Assignee
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Updated
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {cases.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-indigo-600">
                <Link href={`/internal/cases/${c.id}`}>{c.case_reference}</Link>
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {c.property_description}
              </td>
              <td className="whitespace-nowrap px-4 py-2">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadge(c.status)}`}
                >
                  {c.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-700">
                {c.assignee_id}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                {new Date(c.updated_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
