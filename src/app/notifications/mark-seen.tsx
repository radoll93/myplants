"use client";

import { useEffect } from "react";

export const LAST_SEEN_KEY = "myplant-notifications-last-seen";

export default function MarkNotificationsSeen({
  latestCreatedAt,
}: {
  latestCreatedAt: string | null;
}) {
  useEffect(() => {
    if (latestCreatedAt) {
      localStorage.setItem(LAST_SEEN_KEY, latestCreatedAt);
    }
  }, [latestCreatedAt]);

  return null;
}
