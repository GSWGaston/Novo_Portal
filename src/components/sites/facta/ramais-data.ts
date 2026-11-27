export type Ramal = {
  id: number;
  name: string;
  role: string;
  sector: string;
  kind: "Matriz" | "Loja";
  email: string;
  ramal: string;
  /** dd/mm/aaaa; vazio quando o ramal ainda não foi informado */
  updated: string;
  /** dd/mm, data de nascimento (sem ano) */
  birth: string;
};

export const matrizSectors = ["Apoio Jurídico", "Suporte Informática", "Recursos Humanos", "Controladoria", "Facta Financeira", "Comercial"];
export const lojaSectors = ["Loja São José – SC", "Loja Santa Rosa – RS", "Loja Curitiba Centro – PR", "Loja Vitória – ES"];

const first = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Henrique", "Isabela", "João", "Karina", "Lucas", "Marina", "Nelson", "Olívia", "Paulo", "Rafaela", "Sérgio", "Tatiana", "Vítor"];
const last = ["Exemplo Silva", "Exemplo Souza", "Exemplo Lima", "Exemplo Costa", "Exemplo Rocha", "Exemplo Alves", "Exemplo Dias"];
const matrizRoles = ["Assistente operacional júnior", "Analista júnior", "Analista pleno", "Gerente", "Coordenador(a)", "Assistente sênior"];
const lojaRoles = ["Consultor(a) de vendas", "Gerente de loja", "Atendente", "Supervisor(a)"];
const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]+/g, ".");
const pad = (n: number) => String(n).padStart(2, "0");

export const ramais: Ramal[] = Array.from({ length: 64 }, (_, i) => {
  const kind: Ramal["kind"] = i % 3 === 2 ? "Loja" : "Matriz";
  const sector = kind === "Matriz" ? matrizSectors[i % matrizSectors.length] : lojaSectors[i % lojaSectors.length];
  const name = `${first[i % first.length]} ${last[(i * 3) % last.length]}`;
  const hasRamal = i % 11 !== 7;
  return {
    id: i + 1,
    name,
    role: (kind === "Matriz" ? matrizRoles : lojaRoles)[i % (kind === "Matriz" ? matrizRoles.length : lojaRoles.length)],
    sector,
    kind,
    email: `${slug(name)}${i % 4 === 0 ? "" : `${i}`}@exemplo.com.br`,
    ramal: hasRamal ? String(2000 + ((i * 137) % 7000)) : "",
    birth: `${pad(1 + ((i * 11) % 28))}/${pad(1 + ((i * 5) % 12))}`,
    updated: hasRamal ? `${pad(1 + ((i * 5) % 28))}/${pad(1 + ((i * 7) % 12))}/${2024 + (i % 3)}` : "",
  };
}).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
