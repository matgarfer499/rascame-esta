import { redirect } from "next/navigation";

// =============================================================================
// Root Page - Redirects to access denied or shows a generic landing
// The game is only accessible via /play/[secret]
// =============================================================================

export default function HomePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-bunker-950">
      <div className="text-center">
        <h1 className="font-condensed text-4xl text-alert uppercase tracking-wider mb-2">
          ACCESO RESTRINGIDO
        </h1>
        <p className="font-mono text-xs text-text-dead">
          Esta instalación requiere autorización.
        </p>
      </div>
    </main>
  );
}
