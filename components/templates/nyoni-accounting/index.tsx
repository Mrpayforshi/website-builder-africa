import styles from "./NyoniAccountingTemplate.module.css";
import HeroSection, { HeroSectionContent } from "./HeroSection";
import FeatureGridSection, { FeatureGridSectionContent } from "./FeatureGridSection";
import FaqSection, { FaqSectionContent } from "./FaqSection";
import FooterSection, { FooterSectionContent } from "./FooterSection";

export interface NyoniAccountingConfig {
  hero: HeroSectionContent;
  feature_grid: FeatureGridSectionContent;
  faq: FaqSectionContent;
  footer: FooterSectionContent;
}

export default function NyoniAccountingTemplate({ config }: { config: NyoniAccountingConfig }) {
  return (
    <div className={styles.wrapper}>
      <HeroSection content={config.hero} />
      <FeatureGridSection content={config.feature_grid} />
      <FaqSection content={config.faq} />
      <FooterSection content={config.footer} />
    </div>
  );
}
