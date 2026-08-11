import { NextRequest, NextResponse } from "next/server";
import { getGenusDefaults } from "@/lib/plantDefaults";
import type { GrowthType, LightLevel } from "@/lib/types";

export type SpeciesCandidate = {
  scientificName: string;
  commonName: string | null;
  koreanName: string | null;
  family: string | null;
  score: number;
  growthType: GrowthType | null;
  lightLevel: LightLevel | null;
  wateringCriteria: string | null;
  origin: string | null;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "종 식별 기능이 아직 설정되지 않았어요." },
      { status: 500 }
    );
  }

  const incoming = await req.formData();
  const file = incoming.get("image");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "사진이 없어요." }, { status: 400 });
  }

  const plantnetForm = new FormData();
  plantnetForm.append("images", file);
  plantnetForm.append("organs", "leaf");

  try {
    const res = await fetch(
      `https://my-api.plantnet.org/v2/identify/k-world-flora?api-key=${apiKey}`,
      { method: "POST", body: plantnetForm }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `식별에 실패했어요 (${res.status})`, detail: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    const candidates: SpeciesCandidate[] = (data.results ?? [])
      .slice(0, 5)
      .map((r: {
        score: number;
        species: {
          scientificNameWithoutAuthor: string;
          commonNames?: string[];
          family?: { scientificNameWithoutAuthor: string };
        };
      }) => {
        const scientificName = r.species.scientificNameWithoutAuthor;
        const defaults = getGenusDefaults(scientificName);
        return {
          scientificName,
          commonName: r.species.commonNames?.[0] ?? null,
          koreanName: defaults?.koreanName ?? null,
          family: r.species.family?.scientificNameWithoutAuthor ?? null,
          score: r.score,
          growthType: defaults?.growthType ?? null,
          lightLevel: defaults?.lightLevel ?? null,
          wateringCriteria: defaults?.wateringCriteria ?? null,
          origin: defaults?.origin ?? null,
        };
      });

    return NextResponse.json({ candidates });
  } catch {
    return NextResponse.json(
      { error: "식별 서버에 연결하지 못했어요." },
      { status: 502 }
    );
  }
}
