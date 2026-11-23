import { SectorSearch } from "@/components/sites/facta/sector-search";
import { PageTitle, SiteShell } from "@/components/sites/facta/site-shell";

export default function SetoresPage() {
  return (
    <SiteShell menu>
      <PageTitle title="Solicitações dos Setores" trail={["Dashboard", "Solicitações", "Setores"]} />
      <SectorSearch />
    </SiteShell>
  );
}
