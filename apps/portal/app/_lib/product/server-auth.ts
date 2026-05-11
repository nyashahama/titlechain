import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type ServerPilotUser = {
  id?: string;
  email?: string;
  display_name?: string;
  role?: string;
  organization?: {
    name?: string;
  };
};

const apiBaseUrl = process.env.TITLECHAIN_API_BASE_URL ?? "http://localhost:8080";

export async function getCurrentPilotUser(): Promise<ServerPilotUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const response = await fetch(`${apiBaseUrl}/api/pilot/me`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<ServerPilotUser>;
}

export async function requirePilotUser(): Promise<ServerPilotUser> {
  const user = await getCurrentPilotUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return user;
}

export async function requirePilotAdmin(): Promise<ServerPilotUser> {
  const user = await requirePilotUser();

  if (user.role !== "pilot_admin") {
    redirect("/dashboard");
  }

  return user;
}
