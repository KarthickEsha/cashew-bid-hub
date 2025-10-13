import { apiFetch } from "@/lib/api";

// Exchange Clerk session token for backend JWT and store it
export async function exchangeClerkToBackend(
  getClerkToken: () => Promise<string | null>,
  options?: {
    flow?: "google_signup" | "email_sso";
    email?: string;
    password?: string;
    displayName?: string;
  }
) {
  const clerkToken = await getClerkToken();
  if (!clerkToken) throw new Error("Missing Clerk session token");

  const flow = options?.flow ?? "email_sso";

  // Choose endpoint and payload based on the auth flow
  const { email, password, displayName } = options || {};

  let path = "/api/auth/sso";
  let payload: any = { provider: "clerk", email, password };

  // For Google social signup, call register to upsert user and issue JWT
  if (flow === "google_signup") {
    path = "/api/auth/sso";
    payload = { provider: "google", email, password };
  }

  const data = await apiFetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify(payload),
  });

  const token = (data as any)?.token;
  if (!token) throw new Error("Auth exchange returned no token");

  localStorage.setItem("auth_token", token);
  return token as string;
}
