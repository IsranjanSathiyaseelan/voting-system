import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import { electionService } from "../../services/electionService";
import { voteService } from "../../services/voteService";
import { candidateService } from "../../services/candidateService";
import type { Candidate } from "../../types/candidate";
import type { Election } from "../../types/election";
import "./Vote.css";

const Vote = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { electionId, organizationId } = useParams();

  const [elections, setElections] = useState<Election[]>([]);
  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [, setSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const rawId = electionId || organizationId;
    const parsedId = Number(rawId);

    const loadInitialData = async () => {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      setSubmitted(false);

      try {
        const allElections = await electionService.getAll().catch(() => [] as Election[]);
        setElections(allElections);

        let targetElectionId = !Number.isNaN(parsedId) && parsedId > 0 ? parsedId : null;

        if (!targetElectionId && allElections.length > 0) {
          const activeElections = allElections.filter((e) => e.active);
          targetElectionId = activeElections.length > 0 ? activeElections[0].id : allElections[0].id;
        }

        setSelectedElectionId(targetElectionId);

        if (targetElectionId) {
          const [electionObj, candidateData] = await Promise.all([
            electionService.getById(targetElectionId).catch(() => null),
            candidateService.getByElection(targetElectionId).catch(() => []),
          ]);

          setCurrentElection(electionObj);
          setCandidates(candidateData);

          if (user && user.id) {
            const status = await voteService
              .getElectionVoteStatus(user.id, targetElectionId)
              .catch(() => ({ hasVoted: false }));
            setHasVoted(status.hasVoted);
            if (status.hasVoted) setActiveStep(3);
          }
        } else {
          setCandidates([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load voting data.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInitialData();
  }, [electionId, organizationId, user]);

  const handleElectionChange = async (targetId: number) => {
    setSelectedElectionId(targetId);
    setSelectedCandidate(null);
    setSubmitted(false);
    setSuccessMessage("");
    setActiveStep(1);
    setLoading(true);
    setError("");

    try {
      const [electionObj, candidateData] = await Promise.all([
        electionService.getById(targetId).catch(() => null),
        candidateService.getByElection(targetId).catch(() => []),
      ]);

      setCurrentElection(electionObj);
      setCandidates(candidateData);

      if (user && user.id) {
        const status = await voteService
          .getElectionVoteStatus(user.id, targetId)
          .catch(() => ({ hasVoted: false }));
        setHasVoted(status.hasVoted);
        if (status.hasVoted) setActiveStep(3);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to switch election.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCandidateObj = useMemo(() => {
    return candidates.find((c) => c.id === selectedCandidate) ?? null;
  }, [candidates, selectedCandidate]);

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate before confirming your ballot.");
      return;
    }

    if (!user) {
      setError("Unable to submit vote without an authenticated user.");
      return;
    }

    if (!selectedElectionId) {
      setError("Please select an election to cast your vote.");
      return;
    }

    setSending(true);
    setError("");
    setSuccessMessage("");

    try {
      const responseMessage = await voteService.castVote({
        userId: user.id,
        candidateId: selectedCandidate,
        electionId: selectedElectionId,
      });

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === selectedCandidate
            ? { ...c, voteCount: (c.voteCount ?? 0) + 1 }
            : c,
        ),
      );

      setSuccessMessage(
        responseMessage || "Your vote has been cast and recorded successfully!",
      );
      setSubmitted(true);
      setHasVoted(true);
      setActiveStep(3);
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
        {/* Header */}
        <div className="vote-header">
          <span className="badge">
            <HiOutlineShieldCheck /> SECURE DIGITAL BALLOT
          </span>
          <h1>
            {currentElection ? currentElection.title : "Official Election Ballot"}
          </h1>
          <p>
            Welcome, <strong>{user?.username ?? "Voter"}</strong>. Your identity is cryptographically verified and your ballot is anonymous.
          </p>
        </div>

        {/* Ballot Stepper */}
        {!hasVoted && (
          <div className="ballot-stepper">
            <div className={`step-item ${activeStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <div className="step-info">
                <span className="step-label">Step 1</span>
                <span className="step-title">Select Candidate</span>
              </div>
            </div>
            <div className="step-divider" />
            <div className={`step-item ${activeStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <div className="step-info">
                <span className="step-label">Step 2</span>
                <span className="step-title">Review Ballot</span>
              </div>
            </div>
            <div className="step-divider" />
            <div className={`step-item ${activeStep === 3 ? "active" : ""}`}>
              <div className="step-number">3</div>
              <div className="step-info">
                <span className="step-label">Step 3</span>
                <span className="step-title">Confirmation</span>
              </div>
            </div>
          </div>
        )}

        {/* Election Selector Dropdown Card */}
        {elections.length > 1 && !hasVoted && activeStep === 1 && (
          <div className="election-selector-card">
            <div className="election-meta">
              <h2>Active Election Ballot</h2>
              <p>Switch between multiple organization polls if applicable.</p>
            </div>
            <select
              className="election-dropdown"
              value={selectedElectionId ?? ""}
              onChange={(e) => void handleElectionChange(Number(e.target.value))}
            >
              {elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.title} {election.active ? "(Active)" : "(Ended)"}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="error-banner" role="alert">
            <HiOutlineExclamationCircle style={{ fontSize: "1.2rem", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Views */}
        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <p>Encrypting ballot options &amp; verifying eligibility…</p>
          </div>
        ) : hasVoted || activeStep === 3 ? (
          /* Clean Success Screen */
          <div className="receipt-card">
            <div className="receipt-icon">
              <HiOutlineCheckCircle />
            </div>
            <h2>Ballot Successfully Cast!</h2>
            <p>
              {successMessage || "Your vote has been securely recorded on the VoteSecure audit ledger."}
            </p>

            <div className="step-actions" style={{ width: "100%", justifyContent: "center", marginTop: "12px" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate(`/results/${selectedElectionId}`)}
              >
                View Live Results
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/elections")}
              >
                Return to Elections
              </button>
            </div>
          </div>
        ) : activeStep === 1 ? (
          /* Step 1: Candidate Selection List */
          <>
            {candidates.length === 0 ? (
              <div className="loading-box">
                <p>No candidates are registered for this election at this time.</p>
              </div>
            ) : (
              <div className="candidate-list">
                {candidates.map((candidate) => {
                  const isSelected = selectedCandidate === candidate.id;

                  return (
                    <div
                      key={candidate.id}
                      className={`candidate-card ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedCandidate(candidate.id)}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                    >
                      <div className="candidate-profile">
                        <div className="candidate-avatar">{candidate.name.charAt(0)}</div>
                        <div className="candidate-info">
                          <h3>{candidate.name}</h3>
                          <span className="candidate-party">{candidate.party ?? "Independent Candidate"}</span>
                        </div>
                      </div>
                      <div className="selection-indicator">
                        {isSelected && <div className="selection-dot" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="step-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/elections")}
              >
                Back to Elections
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (!selectedCandidate) {
                    setError("Please select a candidate to review your ballot.");
                    return;
                  }
                  setError("");
                  setActiveStep(2);
                }}
                disabled={!selectedCandidate}
              >
                Review Selection →
              </button>
            </div>
          </>
        ) : (
          /* Step 2: Review Screen */
          <div className="review-card">
            <h2>Review Your Selection</h2>
            <p style={{ color: "#6B7280", fontSize: "0.92rem", margin: "0 0 4px" }}>
              Please double-check your choice before casting your final ballot. Once submitted, your selection cannot be changed.
            </p>

            {selectedCandidateObj && (
              <div className="chosen-candidate-box">
                <div className="candidate-profile">
                  <div className="candidate-avatar">{selectedCandidateObj.name.charAt(0)}</div>
                  <div className="candidate-info">
                    <h3>{selectedCandidateObj.name}</h3>
                    <span className="candidate-party">{selectedCandidateObj.party ?? "Independent Candidate"}</span>
                  </div>
                </div>
                <span className="badge" style={{ margin: 0 }}>Selected Choice</span>
              </div>
            )}

            <div className="security-notice">
              <HiOutlineLockClosed />
              <div>
                <strong>Zero-Knowledge Anonymity Enabled:</strong> Your vote is decoupled from your profile cryptographic hash before being logged into the immutable ballot chain.
              </div>
            </div>

            <div className="step-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveStep(1)}
                disabled={sending}
              >
                ← Change Candidate
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitVote}
                disabled={sending}
              >
                {sending ? "Casting Ballot..." : "Confirm & Cast Ballot"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vote;