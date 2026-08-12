"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LAST_SEEN_KEY } from "@/app/notifications/mark-seen";

export default function NotificationBell({
  latestCreatedAt,
}: {
  latestCreatedAt: string | null;
}) {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!latestCreatedAt) {
      setHasUnread(false);
      return;
    }
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    setHasUnread(!lastSeen || new Date(latestCreatedAt) > new Date(lastSeen));
  }, [latestCreatedAt]);

  return (
    <Link
      href="/notifications"
      className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-stone-200 text-lg"
      aria-label="받은 알림"
    >
      🔔
      {hasUnread && (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
      )}
    </Link>
  );
}
