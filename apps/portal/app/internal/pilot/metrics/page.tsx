import { redirect } from "next/navigation";

export default function PilotMetricsPage() {
  redirect("/internal/analytics");
}
