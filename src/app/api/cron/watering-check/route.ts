import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { supabase } from "@/lib/supabase";
import type { Plant } from "@/lib/types";
import { needsWateringToday } from "@/lib/wateringSchedule";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "인증되지 않았어요." }, { status: 401 });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublic || !vapidPrivate || !vapidSubject) {
    return NextResponse.json(
      { error: "푸시 알림이 아직 설정되지 않았어요." },
      { status: 500 }
    );
  }
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const { data: plants } = await supabase.from("plants").select("*");
  const thirsty = (plants ?? []).filter((p: Plant) => needsWateringToday(p));

  if (thirsty.length === 0) {
    return NextResponse.json({ sent: false, reason: "no plants need water today" });
  }

  const title = "🌵 오늘 물 줄 화분이 있어요";
  const body =
    thirsty.length === 1
      ? `${thirsty[0].nickname}에 물을 줄 때예요.`
      : `${thirsty[0].nickname} 외 ${thirsty.length - 1}개 화분에 물을 줄 때예요.`;

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*");

  let sent = 0;
  for (const sub of subscriptions ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({ title, body, url: "/" })
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }

  return NextResponse.json({
    sent: true,
    plantCount: thirsty.length,
    subscriberCount: sent,
  });
}
