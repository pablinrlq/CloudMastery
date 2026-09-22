import Link from "next/link";
import { Logo } from "@/components/logo";
import { StudioIcon, type StudioIconName } from "@/components/studio-icon";
import styles from "./simulado-studio.module.css";

export function StudioShell({ children, certId = "saa", account, exit }: {
  children: React.ReactNode; certId?: string; account?: string; exit?: React.ReactNode;
}) {
  const links: { href: string; title: string; icon: StudioIconName }[] = [
    { href: "/dashboard", title: "Início", icon: "home" },
    { href: `/course/${certId}`, title: "Minha trilha", icon: "book" },
    { href: `/simulado/${certId}`, title: "Simulados", icon: "exam" },
    { href: `/flashcards/${certId}`, title: "Flashcards", icon: "cards" },
  ];
  return (
    <div className={`dark ${styles.studio}`}>
      <a href="#studio-content" className={styles.skip}>Pular para o conteúdo</a>
      <aside className={styles.sidebar}>
        <Logo dark href="/dashboard" size={34} />
        <p className={styles.navLabel}>SEU ESPAÇO DE EVOLUÇÃO</p>
        <nav aria-label="Navegação principal" className={styles.navigation}>
          {links.map((link) => <Link key={link.title} href={link.href} aria-current={link.icon === "exam" ? "page" : undefined}><StudioIcon name={link.icon} /><span>{link.title}</span>{link.icon === "exam" && <span className={styles.activeDot} />}</Link>)}
        </nav>
        <div className={styles.sidebarNote}><span className={styles.tinyLabel}>UM PASSO DE CADA VEZ</span><p>Conhecimento vira confiança com prática.</p><span className={styles.noteLine} /></div>
        <div className={styles.account}><span className={styles.avatar}>{account ? account.charAt(0).toUpperCase() : "CM"}</span><div><strong>{account ?? "Ambiente de prévia"}</strong><span>{account ? "Sua jornada na nuvem" : "Dados demonstrativos"}</span></div></div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}><span>Learning hub <span className={styles.breadcrumb}>/</span> <strong>Simulados</strong></span><div className={styles.topActions}><span className={styles.liveDot} /> Foco na sua próxima conquista {exit}</div></header>
        <main id="studio-content" className={styles.content}>{children}</main>
        <footer className={styles.footer}><span>CloudMastery</span> Material de estudo independente, sem afiliação com a AWS.</footer>
      </div>
    </div>
  );
}

export function StudioHeading({ name, code, certId, preview = false }: { name: string; code: string; certId: string; preview?: boolean }) {
  return <>
    {preview && <p className={styles.previewNotice}>Prévia local · questões demonstrativas · nenhum resultado é gravado na sua conta.</p>}
    <div className={styles.heading}>
      <div><p className={styles.eyebrow}>PRÁTICA COM PROPÓSITO <span> / </span> {code}</p><h1>{name.replace("AWS Certified ", "")}<span>Seu próximo nível começa aqui.</span></h1><p>Leia o cenário. Conecte os conceitos. Decida com confiança.</p></div>
      <div className={styles.compassCard}><div><span className={styles.tinyLabel}>DIREÇÃO CERTA</span><strong>Aprender.<br />Praticar. Evoluir.</strong><span className={styles.compassCaption}>Uma questão de cada vez</span></div><div className={styles.compass} aria-hidden="true"><span>N</span><i /></div></div>
    </div>
    <nav className={styles.certTabs} aria-label="Certificação do simulado">{[["ccp", "Cloud Practitioner", "CLF-C02"], ["saa", "Solutions Architect", "SAA-C03"], ["aif", "AI Practitioner", "AIF-C01"]].map(([id, label, exam]) => <Link key={id} href={preview ? `/preview/simulados?cert=${id}` : `/simulado/${id}`} aria-current={certId === id ? "page" : undefined}>{label}<span>{exam}</span></Link>)}</nav>
  </>;
}

export function PracticeDiagram() {
  return <div className={styles.diagram} aria-label="Fluxo de preparação: estudar conceitos, resolver cenários e revisar decisões" role="img">
    <div className={styles.diagramLabel}><span className={styles.liveDot} /> SEU CICLO DE PREPARAÇÃO</div>
    <div className={styles.diagramNodes}><div><StudioIcon name="book" /><strong>Entender</strong><span>Conceitos e fundamentos</span></div><span className={styles.connector}>→</span><div><StudioIcon name="exam" /><strong>Aplicar</strong><span>Cenários e decisões</span></div><span className={styles.connector}>→</span><div><StudioIcon name="insights" /></div></div>
  </div>;
}
