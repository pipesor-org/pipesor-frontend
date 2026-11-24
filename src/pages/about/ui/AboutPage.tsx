import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useParams } from "react-router-dom";

import { useSession } from "../../../entities/session";
import { ABOUT_VIEWS, aboutPath, authRoutes, isAboutView, type AboutView } from "../../../shared/config";
import { LanguageSelector } from "../../../shared/i18n";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Brand } from "../../../shared/ui/brand";
import { buttonClassName } from "../../../shared/ui/button";
import { PageHeader } from "../../../shared/ui/page-header";
import { TabNav, tabClassName } from "../../../shared/ui/tab-nav";
import { ThemeToggle } from "../../../shared/ui/theme-toggle";
import { AppSidebar } from "../../../widgets/app-sidebar";

import { GettingStarted } from "./GettingStarted";
import { HowItWorks } from "./HowItWorks";
import { AiTransparency, Security } from "./InfoViews";
import { LegalDocument } from "./LegalDocument";
import styles from "./About.module.css";

const VIEWS: Record<AboutView, () => ReactNode> = {
  "how-it-works": () => <HowItWorks />,
  "getting-started": () => <GettingStarted />,
  ai: () => <AiTransparency />,
  security: () => <Security />,
  privacy: () => <LegalDocument document="privacy" />,
  terms: () => <LegalDocument document="terms" />,
};

/** Signed in: inside the app with its sidebar. Signed out: a public bar with the brand, preferences and sign-in. */
function AboutShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation("about");
  const { session } = useSession();
  if (session) return <AppLayout sidebar={<AppSidebar section="about" />}>{children}</AppLayout>;
  return (
    <div className={styles.public}>
      <header className={styles.publicBar}>
        <Link to={aboutPath()} aria-label={t("public.nav")}><Brand /></Link>
        <div className={styles.publicActions}>
          <LanguageSelector />
          <ThemeToggle />
          <Link className={buttonClassName({ variant: "primary", size: "sm" })} to={authRoutes.signIn}>{t("public.signIn")}</Link>
        </div>
      </header>
      <main className={styles.publicMain}>{children}</main>
    </div>
  );
}

/**
 * About Pipesor (`/about/:view`): how it works, getting started, AI
 * transparency, security, the Privacy policy and the Terms of use. Public, so the sign-in screen can link here;
 * product links inside lead through sign-in when there is no session.
 */
export function AboutPage() {
  const { t } = useTranslation("about");
  const { view } = useParams();
  if (!isAboutView(view)) return <Navigate to={aboutPath()} replace />;

  return (
    <AboutShell>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <TabNav label={t("tabsLabel")}>
        {ABOUT_VIEWS.map((target) => (
          <Link key={target} to={aboutPath(target)} className={tabClassName(target === view)} aria-current={target === view ? "page" : undefined}>
            {t(`tabs.${target}`)}
          </Link>
        ))}
      </TabNav>
      {VIEWS[view]()}
    </AboutShell>
  );
}
