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
  HiOutlineDocumentReport,
  HiOutlineTable,
  HiOutlineArrowLeft,
  HiOutlineBadgeCheck,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { organizationService } from "../../services/organizationService";
import { candidateService } from "../../services/candidateService";
import { reportService } from "../../services/reportService";
import type { Candidate } from "../../types/candidate";
import type { Organization } from "../../types/organization";
import type { Election } from "../../types/election";

import "./Results.css";

const CHART_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

const Results = () => {
  const [results, setResults] = useState<Candidate[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { organizationId } = useParams();

  useEffect(() => {
    const loadInitialResults = async () => {
      setLoading(true);
      setError("");

      const parsedOrganizationId = Number(organizationId);

      if (!organizationId || Number.isNaN(parsedOrganizationId)) {
        setError("Invalid organization selected.");
        setLoading(false);
        return;
      }

      try {
        const [orgData, orgElections] = await Promise.all([
          organizationService.getById(parsedOrganizationId),
          organizationService.getElections(parsedOrganizationId).catch(() => [] as Election[]),
        ]);

        setOrganization(orgData);
        setElections(orgElections);

        const activeElections = orgElections.filter((e) => e.active);
        const initialElectionId = activeElections.length > 0 ? activeElections[0].id : (orgElections[0]?.id ?? null);
        setSelectedElectionId(initialElectionId);

        let data: Candidate[] = [];
        if (initialElectionId) {
          data = await candidateService.getResultsByElection(initialElectionId).catch(() => []);
        } else {
          data = await organizationService.getResults(parsedOrganizationId).catch(() => []);
        }

        setResults(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load election results.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInitialResults();
  }, [organizationId]);

  const handleElectionSelect = async (electionId: number) => {
    setSelectedElectionId(electionId);
    setLoading(true);
    setError("");

    try {
      const data = await candidateService.getResultsByElection(electionId);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results for this election.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedElectionId) return;
    setExportingPdf(true);
    try {
      await reportService.exportPdf(selectedElectionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export PDF report.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedElectionId) return;
    setExportingExcel(true);
    try {
      await reportService.exportExcel(selectedElectionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export Excel report.");
    } finally {
      setExportingExcel(false);
    }
  };

  const totalVotes = useMemo(
    () => results.reduce((sum, item) => sum + item.voteCount, 0),
    [results],
  );

  const sortedCandidates = useMemo(() => {
    return [...results].sort((a, b) => b.voteCount - a.voteCount);
  }, [results]);

  const leader = sortedCandidates[0] && sortedCandidates[0].voteCount > 0 ? sortedCandidates[0] : null;

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
              {organization ? `${organization.name} Results` : "Election Dashboard"}
            </h1>
            <p>Real-time encrypted ballot tallying and distribution analytics.</p>
          </div>

          {/* Election Dropdown Selector */}
          {elections.length > 0 && (
            <div className="election-selector-box">
              <label htmlFor="election-select">Active Election</label>
              <select
                id="election-select"
                value={selectedElectionId ?? ""}
                onChange={(e) => void handleElectionSelect(Number(e.target.value))}
                className="select-input"
              >
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title}
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
                <div className="stat-icon-wrapper blue">
                  <HiOutlineChartBar />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Ballots</span>
                  <h2 className="stat-value">{totalVotes.toLocaleString()}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper indigo">
                  <HiOutlineUsers />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Candidates</span>
                  <h2 className="stat-value">{results.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper emerald">
                  <HiOutlineCheckCircle />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Tally Status</span>
                  <h2 className="stat-value status-live">Live Sync</h2>
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
                    const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : "0.0";
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
                            <span className="vote-count">{candidate.voteCount} votes</span>
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

            {/* Action & Export Controls */}
            <div className="export-toolbar">
              <div className="export-group">
                {selectedElectionId && (
                  <>
                    <button
                      type="button"
                      className="btn-export pdf"
                      onClick={() => void handleExportPdf()}
                      disabled={exportingPdf}
                    >
                      <HiOutlineDocumentReport />
                      {exportingPdf ? "Generating PDF..." : "Export PDF Report"}
                    </button>
                    <button
                      type="button"
                      className="btn-export excel"
                      onClick={() => void handleExportExcel()}
                      disabled={exportingExcel}
                    >
                      <HiOutlineTable />
                      {exportingExcel ? "Generating Excel..." : "Export Excel Sheet"}
                    </button>
                  </>
                )}
              </div>

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