import { Shield, Lock, FileCheck, Server, Eye, Database, Clock, Scale } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "End-to-end encryption",
    description: "All data encrypted at rest and in transit with AES-256.",
  },
  {
    icon: Shield,
    title: "POPIA compliant",
    description: "Full compliance with South Africa's data protection regulations.",
  },
  {
    icon: FileCheck,
    title: "Audit trail",
    description: "Complete activity logging for every verification and decision.",
  },
  {
    icon: Server,
    title: "Data residency",
    description: "All data stored and processed within South African borders.",
  },
  {
    icon: Eye,
    title: "Access controls",
    description: "Granular role-based permissions for teams and external parties.",
  },
  {
    icon: Database,
    title: "Automated backups",
    description: "Continuous data protection with point-in-time recovery.",
  },
  {
    icon: Clock,
    title: "99.9% uptime SLA",
    description: "Enterprise-grade availability for mission-critical operations.",
  },
  {
    icon: Scale,
    title: "Legal compliance",
    description: "Aligned with Deeds Registries Act and FIC requirements.",
  },
];

export function Features() {
  return (
    <div className="container py-20">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Safely scale with built-in security and compliance
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-6 transition-shadow hover:shadow-[0px_0px_0px_4px_hsl(0_0%_6%)]"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-orange-500/10">
              <feature.icon className="size-5 text-orange-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
            <p className="mt-1 text-sm text-white/45">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
