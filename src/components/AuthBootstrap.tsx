import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { exchangeClerkToBackend } from "@/lib/authBridge";

export default function AuthBootstrap() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;

    const existing = localStorage.getItem("auth_token");
    if (existing) return;

    const email = user?.primaryEmailAddress?.emailAddress;
    // Call SSO exchange with email so backend can upsert by email
    exchangeClerkToBackend(() => getToken(), email).catch((e) => {
      // Optional: log or surface a toast here
      console.error("Failed to exchange Clerk token:", e);
    });
  }, [isSignedIn, getToken, user]);

  return null;
}
