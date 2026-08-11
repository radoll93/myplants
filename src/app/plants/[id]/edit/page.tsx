import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Plant } from "@/lib/types";
import PlantForm from "@/components/PlantForm";

export const dynamic = "force-dynamic";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: plant, error } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !plant) notFound();

  return <PlantForm plant={plant as Plant} />;
}
