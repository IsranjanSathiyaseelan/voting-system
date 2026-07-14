import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../common/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { organizationService } from "../../services/organizationService";
import { voteService } from "../../services/voteService";
import type { Candidate } from "../../types/candidate";
import type { Organization } from "../../types/organization";
import "./Vote.css";

const Vote = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { organizationId } = useParams();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const parsedOrganizationId = Number(organizationId);

    if (!organizationId || Number.isNaN(parsedOrganizationId)) {
      setError("Invalid organization.");
      setLoading(false);
      return;
    }

    const loadCandidates = async () => {
      setLoading(true);
      setError("");
      setSubmitted(false);
      setHasVoted(false);
      setSelectedCandidate(null);

      try {
        const [organizationData, candidateData, voteStatus] = await Promise.all(
          [
            organizationService.getById(parsedOrganizationId),
            organizationService.getCandidates(parsedOrganizationId),
            user
              ? organizationService.getVoteStatus(user.id, parsedOrganizationId)
              : Promise.resolve({ hasVoted: false }),
          ],
        );

        setOrganization(organizationData);
        setCandidates(candidateData);
        setHasVoted(voteStatus.hasVoted);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load organization.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadCandidates();
  }, [organizationId, user]);

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

    if (!organizationId || Number.isNaN(Number(organizationId))) {
      setError("Invalid organization.");
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
      setHasVoted(true);
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
          <h1>
            {organization
              ? `Vote in ${organization.name}`
              : "Choose Your Candidate"}
          </h1>
          <p>
            Hello {user?.username ?? "Voter"}, review profiles before voting in
            this organization.
          </p>
        </div>

        {loading ? (
          <p>Loading candidates…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : hasVoted ? (
          <div className="summary-card">
            <p>You have already voted in this organization.</p>
            <div className="actions">
              <Button
                text="Back to organizations"
                onClick={() => navigate("/organizations")}
              />
              <Button
                text="View results"
                onClick={() => navigate(`/results/${organizationId}`)}
              />
            </div>
          </div>
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
              disabled={sending || hasVoted}
            />
            <Button
              text="Back to organizations"
              onClick={() => navigate("/organizations")}
            />
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
