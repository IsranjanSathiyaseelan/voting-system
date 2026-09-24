import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyVoteCount } from "../../services/voteService";
import CustomChartTooltip from "./CustomChartTooltip";
import styles from "./AdminDashboard.module.css";

interface DailyVotingChartProps {
  dailyVotes: DailyVoteCount[];
  loading: boolean;
}

const DailyVotingChart = ({ dailyVotes, loading }: DailyVotingChartProps) => {
  return (
    <section className={styles.chartPanel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Daily Voting Volume</h2>
          <p className={styles.muted}>
            24-hour real-time voting trend breakdown across active elections.
          </p>
        </div>
        <div className={styles.timeBadge}>Realtime Feed</div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading analytics feed…</p>
        </div>
      ) : dailyVotes.length === 0 ? (
        <div className={styles.emptyState}>
          No daily vote data recorded yet for this organization.
        </div>
      ) : (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyVotes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5651D8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#5651D8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: "#E0E0E0" }}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: "#E0E0E0" }}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="votes"
                stroke="#5651D8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorVotes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default DailyVotingChart;
