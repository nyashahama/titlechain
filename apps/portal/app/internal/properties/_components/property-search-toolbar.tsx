"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DataToolbar } from "@/app/_components/product/DataToolbar";

export function PropertySearchToolbar({
  initialQuery = "",
  initialLocality = "",
  initialStatus = "",
}: {
  initialQuery?: string;
  initialLocality?: string;
  initialStatus?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [locality, setLocality] = useState(initialLocality);
  const [status, setStatus] = useState(initialStatus);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (locality.trim()) params.set("locality", locality.trim());
    if (status.trim()) params.set("status", status.trim());
    const nextQuery = params.toString();
    router.push(nextQuery ? `/internal/properties?${nextQuery}` : "/internal/properties");
  }

  return (
    <form onSubmit={handleSubmit}>
      <DataToolbar searchLabel="Search properties" query={query} onQueryChange={setQuery} className="border-b-0 pb-0">
        <input
          value={locality}
          onChange={(event) => setLocality(event.target.value)}
          placeholder="Locality"
          className="h-9 w-full rounded-md border border-tc-border bg-tc-surface-subtle px-3 text-[13px] text-tc-text placeholder:text-tc-text-faint focus:border-tc-accent focus:outline-none sm:w-[180px]"
        />
        <input
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          placeholder="Status"
          className="h-9 w-full rounded-md border border-tc-border bg-tc-surface-subtle px-3 text-[13px] text-tc-text placeholder:text-tc-text-faint focus:border-tc-accent focus:outline-none sm:w-[150px]"
        />
        <button
          type="submit"
          className="h-9 rounded-md bg-tc-accent px-3 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Search
        </button>
      </DataToolbar>
    </form>
  );
}
