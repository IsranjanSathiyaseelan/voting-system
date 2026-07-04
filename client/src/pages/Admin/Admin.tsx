import { useEffect, useMemo, useState } from "react";
import Button from "../../common/Button/Button";
import { candidateService } from "../../services/candidateService";
import type { Candidate } from "../../types/candidate";

const Admin = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await candidateService.getCandidates();
        setCandidates(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load candidates.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  const totalVotes = useMemo(
    () => candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0),
    [candidates],
  );

  const handleAddCandidate = async () => {
    if (!name.trim()) {
      setError("Enter a name to add a candidate.");
      return;
    }

    setError("");

    try {
      const newCandidate = await candidateService.addCandidate({
        name: name.trim(),
        voteCount: 0,
      });

      setCandidates((current) => [...current, newCandidate]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add candidate.");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <span className="badge">Admin panel</span>
        <h1>Election administration</h1>
        <p>
          Manage candidates and monitor current totals from a single dashboard.
        </p>

        {loading ? (
          <p>Loading candidates…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <div className="grid two" style={{ marginTop: "24px" }}>
              <div className="card" style={{ padding: "20px" }}>
                <h2>Add candidate</h2>
                <div className="grid" style={{ marginTop: "12px" }}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Candidate name"
                  />
                </div>
                <div style={{ marginTop: "12px" }}>
                  <Button text="Add candidate" onClick={handleAddCandidate} />
                </div>
              </div>

              <div className="card" style={{ padding: "20px" }}>
                <h2>Overview</h2>
                <p style={{ marginTop: "8px" }}>Total ballots: {totalVotes}</p>
                <p>Active candidates: {candidates.length}</p>
              </div>
            </div>

            <div className="card" style={{ marginTop: "20px" }}>
              <h2>Current candidates</h2>
              <div className="grid" style={{ marginTop: "12px" }}>
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="card"
                    style={{ padding: "16px" }}
                  >
                    <strong>{candidate.name}</strong>
                    <p>Votes: {candidate.voteCount}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
