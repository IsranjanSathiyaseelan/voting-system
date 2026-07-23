import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { organizationService } from "../../services/organizationService";
import { candidateService } from "../../services/candidateService";
import { reportService } from "../../services/reportService";
import type { Candidate } from "../../types/candidate";
import type { Organization } from "../../types/organization";
import type { Election } from "../../types/election";

import "./Results.css";

const Results = () => {
  const [results, setResults] = useState<Candidate[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { organizationId } = useParams();

  useEffect(() => {
    const loadInitialResults = async () => {
      setLoading(true);
      setError("");

      const parsedOrganizationId = Number(organizationId);

      if (!organizationId || Number.isNaN(parsedOrganizationId)) {
        setError("Invalid organization.");
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
          err instanceof Error ? err.message : "Unable to load results.",
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
      setError(err instanceof Error ? err.message : "Failed to load election results.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedElectionId) return;
    setExporting(true);
    try {
      await reportService.exportPdf(selectedElectionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export PDF report.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedElectionId) return;
    setExporting(true);
    try {
      await reportService.exportExcel(selectedElectionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export Excel report.");
    } finally {
      setExporting(false);
    }
  };

  const totalVotes = useMemo(
    () => results.reduce((sum, item) => sum + item.voteCount, 0),
    [results],
  );

  return (
    <div className="results-page">
      {/* HEADER */}
      <div className="results-header">
        <span className="badge">Election Results</span>
        <h1>
          {organization
            ? `${organization.name} Results`
            : "Live Voting Dashboard"}
        </h1>
        <p>Real-time vote distribution for this organization</p>
      </div>

      {elections.length > 1 && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>Filter by Election: </label>
          <select
            value={selectedElectionId ?? ""}
            onChange={(e) => void handleElectionSelect(Number(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* TOP STATS */}
      {loading ? (
        <p>Loading results…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : results.length === 0 ? (
        <p>No results are available yet for this election.</p>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <h2>{totalVotes}</h2>
              <p>Total Votes</p>
            </div>

            <div className="stat-card">
              <h2>{results.length}</h2>
              <p>Candidates</p>
            </div>

            <div className="stat-card">
              <h2>Live</h2>
              <p>Status</p>
            </div>
          </div>

          <div className="results-grid">
            <div className="card">
              <h2>Vote Breakdown</h2>

              <div className="list">
                {results.map((candidate) => (
                  <div key={candidate.id} className="list-item">
                    <div className="dot" />
                    <div className="info">
                      <h3>{candidate.name}</h3>
                      <p>{candidate.voteCount} votes</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="total">
                Total ballots: <strong>{totalVotes}</strong>
              </div>
            </div>

            <div className="card chart-card">
              <h2>Vote Share</h2>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={results}
                    dataKey="voteCount"
                    nameKey="name"
                    outerRadius={100}
                  >
                    {results.map((entry, index) => (
                      <Cell
                        key={entry.id}
                        fill={["#4f46e5", "#0f766e", "#f59e0b", "#ec4899", "#8b5cf6"][index % 5]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {selectedElectionId && (
              <>
                <button
                  type="button"
                  className="back-button"
                  onClick={() => void handleExportPdf()}
                  disabled={exporting}
                >
                  {exporting ? "Exporting..." : "Download PDF Report"}
                </button>
                <button
                  type="button"
                  className="back-button"
                  onClick={() => void handleExportExcel()}
                  disabled={exporting}
                >
                  {exporting ? "Exporting..." : "Download Excel Report"}
                </button>
              </>
            )}
            <button
              type="button"
              className="back-button"
              style={{ background: "#6b7280" }}
              onClick={() => navigate("/organizations")}
            >
              Back to organizations
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
