import { Suspense } from "react";
import { AppShell } from "@/components/sites/facta/app-shell";
import { PortalHome } from "@/components/sites/facta/portal-home";

export default function Home() {
  return (
    <AppShell variant="portal">
      <Suspense>
        <PortalHome />
      </Suspense>
    </AppShell>
  );
}
