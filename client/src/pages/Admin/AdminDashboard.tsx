import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
// import Button from "../../common/Button/Button";
// import { useAuth } from "../../hooks/useAuth";
import { organizationService } from "../../services/organizationService";
import { voteService, type DailyVoteCount } from "../../services/voteService";
import type { Candidate } from "../../types/candidate";
import type { Organization } from "../../types/organization";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  // const { logout } = useAuth();
  // const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [dailyVotes, setDailyVotes] = useState<DailyVoteCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [organizationData, candidateData, dailyVoteData] =
          await Promise.all([
            organizationService.getAll(),
            organizationService.getResults(0).catch(() => [] as Candidate[]),
            voteService.getDailyVotes(),
          ]);

        setOrganizations(organizationData);
        setCandidates(candidateData);
        setDailyVotes(dailyVoteData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const totalVotes = useMemo(
    () => candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0),
    [candidates],
  );

  const leadingCandidate = useMemo(
    () => [...candidates].sort((a, b) => b.voteCount - a.voteCount)[0] ?? null,
    [candidates],
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero} id="overview">
        <div>
          <span className={styles.badge}>Admin panel</span>
          <h1>Election administration</h1>
          <p>Track live voting, organizations, and candidate activity.</p>
        </div>
      </section>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h2>Total organizations</h2>
          <p>{organizations.length}</p>
        </div>
        <div className={styles.statCard}>
          <h2>Total candidates</h2>
          <p>{candidates.length}</p>
        </div>
        <div className={styles.statCard}>
          <h2>Total ballots</h2>
          <p>{totalVotes}</p>
        </div>
        <div className={styles.statCard}>
          <h2>Leading candidate</h2>
          <p>{leadingCandidate ? leadingCandidate.name : "No votes yet"}</p>
        </div>
      </div>

      <section className={styles.panel} id="daily-votes">
        <h2>Daily votes</h2>
        <p className={styles.muted}>
          Track voting activity across all organizations.
        </p>

        {loading ? (
          <p className={styles.muted}>Loading chart…</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : dailyVotes.length === 0 ? (
          <div className={styles.emptyState}>
            No vote history is available yet.
          </div>
        ) : (
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyVotes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="votes" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
