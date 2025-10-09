import { apiFetch } from "@/lib/api";

// Exchange Clerk session token for backend JWT and store it
export async function exchangeClerkToBackend(
  getClerkToken: () => Promise<string | null>,
  email?: string,
  password?: string,
) {
  const clerkToken = await getClerkToken();
  if (!clerkToken) throw new Error("Missing Clerk session token");

  // Call backend SSO endpoint which will upsert by email and return backend JWT
  const res = await fetch("http://127.0.0.1:8081/api/auth/sso", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify({ provider: "clerk", email, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `SSO exchange failed (${res.status})`);
  }
  const data = await res.json();
  if (!data?.token) throw new Error("SSO exchange returned no token");

  localStorage.setItem("auth_token", data.token);
  return data.token as string;
}
