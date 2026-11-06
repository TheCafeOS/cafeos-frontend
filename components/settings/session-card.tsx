"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  getAuthSessions,
  logoutCurrentSession,
  revokeAuthSession,
} from "@/services/auth.service";
import type { AuthSession } from "@/types/auth.types";

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
};

export function SessionCard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);

  const refreshSessions = useCallback(async () => {
    setLoadError(null);
    try {
      setSessions(await getAuthSessions());
    } catch {
      setLoadError("Unable to load active sessions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const serverRevoked = await logoutCurrentSession();
      toast[serverRevoked ? "success" : "warning"](
        serverRevoked
          ? "Logged out successfully."
          : "Logged out on this device, but server revocation could not be confirmed.",
      );
    } finally {
      router.replace("/login");
      setIsLoggingOut(false);
    }
  };

  const handleRevokeSession = async (session: AuthSession) => {
    if (session.current || revokingSessionId) return;
    if (!window.confirm("Revoke this active session?")) return;

    setRevokingSessionId(session.id);
    try {
      await revokeAuthSession(session.id);
      toast.success("Session revoked.");
      await refreshSessions();
    } catch {
      toast.error("Unable to revoke this session. Please try again.");
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeOthers = async () => {
    const otherSessions = sessions.filter((session) => !session.current);
    if (!otherSessions.length || isRevokingOthers) return;
    if (
      !window.confirm(
        `Log out ${otherSessions.length} other active session${otherSessions.length === 1 ? "" : "s"}? This device will remain signed in.`,
      )
    ) {
      return;
    }

    setIsRevokingOthers(true);
    let revokedCount = 0;
    let failedCount = 0;
    try {
      for (const session of otherSessions) {
        try {
          await revokeAuthSession(session.id);
          revokedCount += 1;
        } catch {
          failedCount += 1;
        }
      }

      await refreshSessions();
      if (failedCount) {
        toast.warning(
          `Revoked ${revokedCount}; ${failedCount} session${failedCount === 1 ? "" : "s"} could not be revoked.`,
        );
      } else {
        toast.success(
          revokedCount === 1
            ? "Other session revoked."
            : `${revokedCount} other sessions revoked.`,
        );
      }
    } finally {
      setIsRevokingOthers(false);
    }
  };

  const otherSessionCount = sessions.filter(
    (session) => !session.current,
  ).length;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <LogOut className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900">
              Sessions
            </h2>
            <p className="text-sm text-stone-500">
              Review and revoke active sign-ins.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void refreshSessions()}
          disabled={isLoading || isRevokingOthers}
          aria-label="Refresh sessions"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p role="status" className="text-sm text-stone-500">
            Loading active sessions…
          </p>
        ) : loadError ? (
          <div role="alert" className="space-y-3 text-sm text-red-700">
            <p>{loadError}</p>
            <Button variant="outline" size="sm" onClick={() => void refreshSessions()}>
              Try again
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            No active sessions were returned.
          </p>
        ) : (
          sessions.map((session) => (
            <article
              key={session.id}
              className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1 text-sm text-stone-600">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-stone-900">
                    {session.current ? "This device" : "Active session"}
                  </span>
                  {session.current && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Current
                    </span>
                  )}
                </div>
                <p>Created: {formatDate(session.createdAt)}</p>
                <p>Last used: {formatDate(session.lastUsedAt)}</p>
                <p>Expires: {formatDate(session.expiresAt)}</p>
              </div>
              {session.current ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleLogout()}
                  disabled={isLoggingOut}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleRevokeSession(session)}
                  disabled={Boolean(revokingSessionId) || isRevokingOthers}
                >
                  {revokingSessionId === session.id ? "Revoking…" : "Revoke"}
                </Button>
              )}
            </article>
          ))
        )}
      </div>

      {!isLoading && !loadError && otherSessionCount > 0 && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => void handleRevokeOthers()}
          disabled={isRevokingOthers || Boolean(revokingSessionId)}
        >
          {isRevokingOthers ? "Revoking other sessions…" : "Log out other sessions"}
        </Button>
      )}
    </section>
  );
}
