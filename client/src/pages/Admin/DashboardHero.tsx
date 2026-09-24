import { Link } from "react-router-dom";
import { HiOutlineSparkles, HiOutlinePlus } from "react-icons/hi";
import styles from "./AdminDashboard.module.css";

const DashboardHero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroMain}>
        <div className={styles.heroBadge}>
          <HiOutlineSparkles />
          <span>SAAS ELECTION GOVERNANCE</span>
        </div>
        <h1>System Overview &amp; Analytics</h1>
        <p>
          Real-time multi-tenant telemetry, voter turnout rates, active elections, candidate management, and ballot verification logs.
        </p>
      </div>
      <div className={styles.heroActions}>
        <div className={styles.livePill}>
          <span className={styles.pulseDot} />
          LIVE TELEMETRY
        </div>
        <div className={styles.quickButtons}>
        </div>
      </div>
    </section>
  );
};

export default DashboardHero;
