import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  HiOutlineArrowLeft,
  HiOutlineBadgeCheck,
  HiOutlineUsers,
} from "react-icons/hi";
import { electionService } from "../../services/electionService";
import { candidateService } from "../../services/candidateService";
import type { Candidate } from "../../types/candidate";
import type { Election } from "../../types/election";

import "./Results.css";

const CHART_COLORS = ["#5651D8", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

const Results = () => {
  const [results, setResults] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // Route is /results/:electionId — must match the route param name
  const { electionId: electionIdParam } = useParams<{ electionId?: string }>();

  useEffect(() => {
    const loadInitialResults = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch all elections scoped to the logged-in user's org (backend enforces tenant)
        const allElections = await electionService.getAll().catch(() => [] as Election[]);
        setElections(allElections);

        // Determine which election to show: prefer URL param, then first active, then first overall
        const parsedId = Number(electionIdParam);
        let targetId: number | null = null;

        if (electionIdParam && !Number.isNaN(parsedId) && parsedId > 0) {
          targetId = parsedId;
        } else if (allElections.length > 0) {
          const active = allElections.filter((e) => e.active);
          targetId = active.length > 0 ? active[0].id : allElections[0].id;
        }

        setSelectedElectionId(targetId);

        if (targetId) {
          const [electionObj, data] = await Promise.all([
            electionService.getById(targetId).catch(() => null),
            candidateService.getResultsByElection(targetId).catch(() => [] as Candidate[]),
          ]);
          setCurrentElection(electionObj);
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load election results.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInitialResults();
  }, [electionIdParam]);

  const handleElectionSelect = async (id: number) => {
    setSelectedElectionId(id);
    setLoading(true);
    setError("");

    try {
      const [electionObj, data] = await Promise.all([
        electionService.getById(id).catch(() => null),
        candidateService.getResultsByElection(id).catch(() => [] as Candidate[]),
      ]);
      setCurrentElection(electionObj);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results for this election.");
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = useMemo(
    () => results.reduce((sum, item) => sum + (item.voteCount ?? 0), 0),
    [results],
  );

  const sortedCandidates = useMemo(() => {
    return [...results].sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0));
  }, [results]);

  const leader = sortedCandidates[0] && (sortedCandidates[0].voteCount ?? 0) > 0 ? sortedCandidates[0] : null;

  return (
    <div className="results-page">
      <div className="results-shell">
        {/* Navigation Header */}
        <div className="results-top-nav">
          <button
            type="button"
            className="btn-text-back"
            onClick={() => navigate(-1)}
          >
            <HiOutlineArrowLeft /> Back
          </button>
        </div>

        <div className="results-hero">
          <div className="hero-details">
            <span className="badge">Verified Analytics</span>
            <h1>
              {currentElection ? `${currentElection.title} — Results` : "Election Results"}
            </h1>
            <p>Real-time encrypted ballot tallying and distribution analytics.</p>
          </div>

          {/* Election Dropdown Selector */}
          {elections.length > 0 && (
            <div className="election-selector-box">
              <label htmlFor="election-select">Select Election</label>
              <select
                id="election-select"
                value={selectedElectionId ?? ""}
                onChange={(e) => void handleElectionSelect(Number(e.target.value))}
                className="select-input"
              >
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title} {election.active ? "(Active)" : "(Ended)"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Dynamic Content */}
        {loading ? (
          <div className="skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : error ? (
          <div className="error-card">
            <p>{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Votes Recorded</h3>
            <p>There are no votes or candidate records available for this election yet.</p>
          </div>
        ) : (
          <>
            {/* Top Stat Summary Cards */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon-wrapper indigo">
                  <HiOutlineUsers />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Candidates</span>
                  <h2 className="stat-value">{results.length}</h2>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="results-grid">
              {/* Vote Breakdown Column */}
              <div className="card breakdown-card">
                <div className="card-header">
                  <h2>Candidate Breakdown</h2>
                  <span className="total-badge">{totalVotes} Total Votes</span>
                </div>

                <div className="candidate-list">
                  {sortedCandidates.map((candidate, idx) => {
                    const percentage = totalVotes > 0 ? (((candidate.voteCount ?? 0) / totalVotes) * 100).toFixed(1) : "0.0";
                    const isLeader = leader?.id === candidate.id;
                    const color = CHART_COLORS[idx % CHART_COLORS.length];

                    return (
                      <div key={candidate.id} className={`candidate-item ${isLeader ? "is-leader" : ""}`}>
                        <div className="candidate-top">
                          <div className="candidate-name-box">
                            <span className="color-indicator" style={{ backgroundColor: color }} />
                            <span className="candidate-name">{candidate.name}</span>
                            {isLeader && (
                              <span className="leader-tag">
                                <HiOutlineBadgeCheck /> Leader
                              </span>
                            )}
                          </div>
                          <div className="candidate-metrics">
                            <span className="vote-count">{candidate.voteCount ?? 0} votes</span>
                            <span className="percentage-text">{percentage}%</span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${percentage}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart Column */}
              <div className="card chart-card">
                <div className="card-header">
                  <h2>Vote Share Distribution</h2>
                </div>

                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={results}
                        dataKey="voteCount"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {results.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderRadius: "10px",
                          color: "#fff",
                          border: "none",
                          fontSize: "0.85rem",
                          boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Donut Chart Center Text */}
                  <div className="chart-center-text">
                    <span className="center-value">{totalVotes}</span>
                    <span className="center-label">Votes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="export-toolbar" style={{ justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/elections")}
              >
                Back to Elections
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Results;