import { notFound } from "next/navigation";
import { LevelPageClient } from "@/components/game/LevelPageClient";

export default function LevelPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  if (!id) notFound();
  return <LevelPageClient levelId={id} worldId="1" />;
}
