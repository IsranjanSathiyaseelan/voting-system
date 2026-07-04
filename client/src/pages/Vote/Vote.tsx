import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../common/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { candidateService } from "../../services/candidateService";
import { voteService } from "../../services/voteService";
import type { Candidate } from "../../types/candidate";
import "./Vote.css";

const Vote = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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

  const summary = useMemo(() => {
    if (!selectedCandidate) return "Select a candidate to continue.";

    const candidate = candidates.find((item) => item.id === selectedCandidate);
    return candidate ? `You selected ${candidate.name}.` : "";
  }, [candidates, selectedCandidate]);

  const handleSubmit = async () => {
    if (!selectedCandidate) {
      setError("Select a candidate before submitting.");
      return;
    }

    if (!user) {
      setError("Unable to submit vote without an authenticated user.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await voteService.castVote({
        userId: user.id,
        candidateId: selectedCandidate,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit your vote.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="vote-page">
      <div className="vote-container">
        <div className="vote-header">
          <span className="badge">🗳 Ballot Paper</span>
          <h1>Choose Your Candidate</h1>
          <p>
            Hello {user?.username ?? "Voter"}, review profiles before voting.
          </p>
        </div>

        {loading ? (
          <p>Loading candidates…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : candidates.length === 0 ? (
          <p>No candidates are available at this time.</p>
        ) : (
          <div className="candidate-grid">
            {candidates.map((candidate) => {
              const isSelected = selectedCandidate === candidate.id;

              return (
                <div
                  key={candidate.id}
                  className={`candidate-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <div className="avatar">{candidate.name.charAt(0)}</div>
                  <div className="candidate-info">
                    <h3>{candidate.name}</h3>
                    <p>{candidate.party ?? "Candidate"}</p>
                    <span className="tag">Verified Candidate</span>
                  </div>
                  <div className="select-box">{isSelected ? "✔" : ""}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="summary-card">
          <p>{summary}</p>

          <div className="actions">
            <Button
              text={sending ? "Submitting..." : "Submit Vote"}
              onClick={handleSubmit}
            />
            <Button text="Back Home" onClick={() => navigate("/Home")} />
          </div>

          {submitted && (
            <p className="success">✔ Vote recorded successfully.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vote;
