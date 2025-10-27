import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { exchangeClerkToBackend } from "@/lib/authBridge";
import { useProfile } from "@/hooks/useProfile";
import { extractBackendUserId } from "@/lib/profile";
import { ensureFcmToken } from "@/hooks/useFCM";

export default function AuthBootstrap() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { loadProfileFromBackend } = useProfile();

  useEffect(() => {
    if (!isSignedIn) return;

    const existing = localStorage.getItem("auth_token");
    if (existing) {
      const id = extractBackendUserId() || user?.id;
      if (id) loadProfileFromBackend(id).catch(() => {});
      const vapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined)?.trim()
  ?? 'BGjilRB8cChm-rSmFdVXPWu725bYDcOUhJ_nLWz3kZC5bZA2rkxC8wkOaxgDUKnk176-TespEC-ZOuhgx0Em5ss';
      if (vapidKey) void ensureFcmToken(vapidKey);
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress || undefined;
    const displayName = user?.fullName || user?.username || undefined;

    // Detect if user has a Google external account; Clerk providers often expose id like "oauth_google"
    const hasGoogle = (user as any)?.externalAccounts?.some?.(
      (ea: any) => (ea?.provider || ea?.id)?.toString()?.toLowerCase()?.includes("google")
    );

    const flow = hasGoogle ? "google_signup" : "email_sso";

    exchangeClerkToBackend(() => getToken(), {
      flow,
      email,
      displayName,
    })
      .then(() => {
        const id = extractBackendUserId() || user?.id;
        if (id) loadProfileFromBackend(id).catch(() => {});
        const vapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined)?.trim();
        if (vapidKey) void ensureFcmToken(vapidKey);
      })
      .catch((e) => {
        // Optional: log or surface a toast here
        console.error("Failed to exchange Clerk token:", e);
      });
  }, [isSignedIn, getToken, user]);

  return null;
}