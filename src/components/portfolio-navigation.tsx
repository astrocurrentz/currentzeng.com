import styles from "./portfolio-overview.module.css";

export function PortfolioNavigation() {
  return (
    <nav aria-label="Portfolio" className={styles.navigation}>
      <a href="#engineering">Engineering</a>
      <a href="#area">Creative work</a>
      <a href="#resume">Résumé</a>
      <a href="#contact">Contact</a>
    </nav>
  );
}
