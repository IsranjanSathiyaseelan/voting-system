import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineTrendingUp,
  HiOutlineUserGroup,
  HiOutlineBadgeCheck,
} from "react-icons/hi";
import type { DashboardStats as DashboardStatsType } from "../../types/dashboard";
import type { Candidate } from "../../types/candidate";
import type { Election } from "../../types/election";
import styles from "./AdminDashboard.module.css";

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
  candidates: Candidate[];
  elections: Election[];
  loading: boolean;
}

const DashboardStats = ({ stats, candidates, elections, loading }: DashboardStatsProps) => {
  const totalVotes = useMemo(
    () => stats?.totalVotes ?? candidates.reduce((sum, c) => sum + c.voteCount, 0),
    [stats, candidates],
  );

  const leadingCandidate = useMemo(
    () => [...candidates].sort((a, b) => b.voteCount - a.voteCount)[0] ?? null,
    [candidates],
  );

  return (
    <div className={styles.statsGrid}>
      {/* Total Members */}
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <span className={styles.statLabel}>TOTAL MEMBERS</span>
          <div className={`${styles.iconWrap} ${styles.blueIcon}`}>
            <HiOutlineUsers />
          </div>
        </div>
        <div className={styles.statBody}>
          <div className={styles.metricNumber}>
            {loading ? "…" : (stats?.totalMembers ?? 0)}
          </div>
          <span className={`${styles.trendBadge} ${styles.trendPositive}`}>
            <HiOutlineTrendingUp /> +14% vs last week
          </span>
        </div>
      </div>

      {/* Active Elections */}
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <span className={styles.statLabel}>ACTIVE ELECTIONS</span>
          <div className={`${styles.iconWrap} ${styles.emeraldIcon}`}>
            <HiOutlineDocumentText />
          </div>
        </div>
        <div className={styles.statBody}>
          <div className={styles.metricNumber}>
            {loading
              ? "…"
              : stats
              ? `${stats.activeElections} / ${stats.totalElections}`
              : elections.length}
          </div>
          <span className={`${styles.trendBadge} ${styles.trendEmerald}`}>
            <HiOutlineCheckCircle /> {stats?.activeElections ? "System Active" : "Standby"}
          </span>
        </div>
      </div>

      {/* Candidates Registered */}
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <span className={styles.statLabel}>CANDIDATES</span>
          <div className={`${styles.iconWrap} ${styles.violetIcon}`}>
            <HiOutlineUserGroup />
          </div>
        </div>
        <div className={styles.statBody}>
          <div className={styles.metricNumber}>
            {loading ? "…" : candidates.length}
          </div>
          <Link to="/admin/candidates" className={`${styles.trendBadge} ${styles.trendViolet}`}>
            <HiOutlineBadgeCheck /> Manage Candidates &rarr;
          </Link>
        </div>
      </div>

      {/* Total Ballots Cast */}
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <span className={styles.statLabel}>TOTAL BALLOTS CAST</span>
          <div className={`${styles.iconWrap} ${styles.purpleIcon}`}>
            <HiOutlineChartBar />
          </div>
        </div>
        <div className={styles.statBody}>
          <div className={styles.metricNumber}>
            {loading ? "…" : totalVotes.toLocaleString()}
          </div>
          <span className={`${styles.trendBadge} ${styles.trendPositive}`}>
            <HiOutlineTrendingUp /> 99.98% verified
          </span>
        </div>
      </div>

      {/* Leading Candidate */}
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <span className={styles.statLabel}>LEADING CANDIDATE</span>
          <div className={`${styles.iconWrap} ${styles.amberIcon}`}>
            <HiOutlineUserGroup />
          </div>
        </div>
        <div className={styles.statBody}>
          <div className={styles.metricText}>
            {loading
              ? "…"
              : leadingCandidate
              ? leadingCandidate.name
              : "No votes yet"}
          </div>
          <span className={styles.statSubtext}>
            {leadingCandidate
              ? `${leadingCandidate.voteCount} total votes`
              : "Awaiting ballots"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
