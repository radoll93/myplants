import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MarkNotificationsSeen from "./mark-seen";

export const dynamic = "force-dynamic";

type NotificationRow = {
  id: string;
  created_at: string;
  title: string;
  body: string;
  plant_names: string[];
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function NotificationsPage() {
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <MarkNotificationsSeen latestCreatedAt={notifications?.[0]?.created_at ?? null} />

      <Link href="/" className="text-sm text-stone-500">
        ← 홈으로
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-stone-800">
        🔔 받은 알림
      </h1>

      {error && (
        <p className="mt-6 text-sm text-red-600">
          알림을 불러오지 못했어요: {error.message}
        </p>
      )}

      {!error && (!notifications || notifications.length === 0) && (
        <p className="mt-16 text-center text-sm text-stone-500">
          아직 받은 알림이 없어요.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {(notifications as NotificationRow[] | null)?.map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-stone-200 bg-white p-3"
          >
            <p className="text-xs text-stone-400">
              {formatDateTime(n.created_at)}
            </p>
            <p className="mt-1 text-sm font-medium text-stone-800">
              {n.title}
            </p>
            <p className="mt-1 text-sm text-stone-600">{n.body}</p>
            {n.plant_names.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {n.plant_names.map((name, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
