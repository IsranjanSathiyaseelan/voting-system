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
import type { Candidate } from "../../types/candidate";
import type { Organization } from "../../types/organization";

import "./Results.css";

const Results = () => {
  const [results, setResults] = useState<Candidate[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { organizationId } = useParams();

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      setError("");

      const parsedOrganizationId = Number(organizationId);

      if (!organizationId || Number.isNaN(parsedOrganizationId)) {
        setError("Invalid organization.");
        setLoading(false);
        return;
      }

      try {
        const [organizationData, data] = await Promise.all([
          organizationService.getById(parsedOrganizationId),
          organizationService.getResults(parsedOrganizationId),
        ]);

        setOrganization(organizationData);
        setResults(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load results.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadResults();
  }, [organizationId]);

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

      {/* TOP STATS */}
      {loading ? (
        <p>Loading results…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : results.length === 0 ? (
        <p>No results are available yet.</p>
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
                        fill={["#4f46e5", "#0f766e", "#f59e0b"][index % 3]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              type="button"
              className="back-button"
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
