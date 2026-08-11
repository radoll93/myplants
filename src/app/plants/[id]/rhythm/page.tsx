import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Plant, PlantLog } from "@/lib/types";
import { analyzeMonthlyActivity, dataSpanDays } from "@/lib/rhythmAnalysis";

export const dynamic = "force-dynamic";

const GROWTH_TYPE_NOTE: Record<string, string> = {
  여름형: "일반적으로 6~9월이 성장기, 12~2월이 휴면기에 가까워요.",
  여름휴면형: "일반적으로 6~8월엔 더위로 휴면하고, 봄·가을·겨울에 자라요.",
  봄가을형: "일반적으로 봄·가을에 잘 자라고, 한여름·한겨울엔 더디게 자라요.",
};

export default async function RhythmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: plant, error }, { data: logs }] = await Promise.all([
    supabase.from("plants").select("*").eq("id", id).single(),
    supabase.from("logs").select("*").eq("plant_id", id),
  ]);

  if (error || !plant) notFound();

  const p = plant as Plant;
  const allLogs = (logs ?? []) as PlantLog[];
  const months = analyzeMonthlyActivity(allLogs);
  const span = dataSpanDays(allLogs);
  const maxCount = Math.max(1, ...months.map((m) => m.total));
  const enoughData = span >= 60 && allLogs.length >= 5;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <Link href={`/plants/${p.id}`} className="text-sm text-stone-500">
        ← {p.nickname}
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-stone-800">연간 리듬</h1>

      {p.growth_type && GROWTH_TYPE_NOTE[p.growth_type] && (
        <p className="mt-2 text-sm text-stone-500">
          생장기 타입: <strong>{p.growth_type}</strong> —{" "}
          {GROWTH_TYPE_NOTE[p.growth_type]}
        </p>
      )}

      {!enoughData && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          아직 기록 데이터가 부족해요. 최소 2~3개월, 여러 계절에 걸쳐
          꾸준히 기록을 남기면 이 화분만의 패턴이 아래 그래프에 보이기
          시작해요. 지금 그래프는 참고만 해주세요.
        </p>
      )}

      <div className="mt-6">
        <p className="text-sm font-medium text-stone-700">월별 기록 횟수</p>
        <div className="mt-3 flex items-end gap-1.5" style={{ height: 140 }}>
          {months.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-emerald-400"
                style={{
                  height: `${(m.total / maxCount) * 100}px`,
                  minHeight: m.total > 0 ? 4 : 0,
                }}
                title={`${m.month}월: 기록 ${m.total}회`}
              />
              <span className="text-[10px] text-stone-400">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
        <StatBox label="총 기록" value={`${allLogs.length}회`} />
        <StatBox
          label="물주기 기록"
          value={`${months.reduce((s, m) => s + m.watering, 0)}회`}
        />
        <StatBox
          label="개화 기록"
          value={`${months.reduce((s, m) => s + m.bloom, 0)}회`}
        />
      </div>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 py-3">
      <p className="text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-700">{value}</p>
    </div>
  );
}
