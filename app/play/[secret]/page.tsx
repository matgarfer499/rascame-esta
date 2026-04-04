import AccessDeniedScreen from "@/components/screens/access-denied-screen";
import GameOrchestrator from "@/components/game-orchestrator";

// =============================================================================
// Protected Game Route - /play/[secret]
// Validates the secret parameter against the environment variable.
// =============================================================================

type PlayPageProps = {
  params: Promise<{ secret: string }>;
};

export default async function PlayPage({ params }: PlayPageProps) {
  const { secret } = await params;
  console.log("Received secret:", secret);
  const validSecret = process.env.GAME_SECRET;

  // If no secret is configured, deny access
  if (!validSecret || secret !== validSecret) {
    return <AccessDeniedScreen />;
  }

  return <GameOrchestrator secret={secret} />;
}

/** Prevent static generation — this route must be dynamic */
export const dynamic = "force-dynamic";
