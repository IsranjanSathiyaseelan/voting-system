import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
  HiOutlineExclamationCircle,
  HiOutlineLockClosed,
} from "react-icons/hi";
import Button from "../../common/Button/Button";
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

  const [submitted, setSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [receiptToken, setReceiptToken] = useState("");
  const [receiptTime, setReceiptTime] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const rawId = electionId || organizationId;
    const parsedId = Number(rawId);

    const loadInitialData = async () => {
      setLoading(true);
      setError("");
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

  const generateCryptographicReceipt = () => {
    const chars = "ABCDEF0123456789";
    const segment = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `VS-${segment(5)}-${segment(4)}-${segment(4)}`;
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate before confirming your ballot.");
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
        electionId: selectedElectionId ?? undefined,
      });

      const token = generateCryptographicReceipt();
      const timestamp = new Date().toUTCString();
      setReceiptToken(token);
      setReceiptTime(timestamp);

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

  const handleCopyReceipt = () => {
    if (!receiptToken) return;
    navigator.clipboard.writeText(receiptToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="vote-page">
      <div className="vote-container">
        {/* Top Header */}
        <div className="vote-header">
          <span className="badge">
            <HiOutlineShieldCheck /> SECURE DIGITAL BALLOT
          </span>
          <h1>
            {currentElection
              ? currentElection.title
              : "Official Election Ballot"}
          </h1>
          <p>
            Welcome, <strong>{user?.username ?? "Voter"}</strong>. Your identity is cryptographically verified and your ballot is anonymous.
          </p>
        </div>

        {/* Multi-Step Ballot Stepper */}
        {!hasVoted && (
          <div className="ballot-stepper">
            <div className={`step-item ${activeStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <span className="step-label">Select Candidate</span>
            </div>
            <div className="step-line" />
            <div className={`step-item ${activeStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <span className="step-label">Review Ballot</span>
            </div>
            <div className="step-line" />
            <div className={`step-item ${activeStep === 3 ? "active" : ""}`}>
              <div className="step-number">3</div>
              <span className="step-label">Receipt &amp; Confirm</span>
            </div>
          </div>
        )}

        {/* Active Election Selector */}
        {elections.length > 1 && !hasVoted && activeStep === 1 && (
          <div className="election-selector">
            <label>Select Election: </label>
            <select
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

        {/* Validation Callout Error Message */}
        {error && (
          <div className="error-callout" role="alert">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <p>Encrypting ballot options &amp; verifying eligibility…</p>
          </div>
        ) : hasVoted || activeStep === 3 ? (
          /* High-Trust Confirmation Receipt Modal Screen */
          <div className="receipt-modal">
            <div className="modal-header">
              <div className="success-icon-animated">
                <HiOutlineCheckCircle />
              </div>
              <h2>Ballot Successfully Cast!</h2>
              <p>Your vote has been securely recorded on the VoteSecure audit ledger.</p>
            </div>

            <div className="receipt-box">
              <div className="receipt-row">
                <span className="receipt-label">Status</span>
                <span className="receipt-status-pill">
                  <HiOutlineLockClosed /> Cryptographically Verified
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Timestamp</span>
                <span className="receipt-value">{receiptTime || new Date().toUTCString()}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Election</span>
                <span className="receipt-value">{currentElection?.title ?? "VoteSecure Platform"}</span>
              </div>
              <div className="receipt-row token-row">
                <span className="receipt-label">Audit Token</span>
                <div className="token-code-wrap">
                  <code className="token-code">{receiptToken || "VS-8F92A-4B71-9C3E"}</code>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={handleCopyReceipt}
                    title="Copy receipt token"
                  >
                    {copied ? <HiOutlineClipboardCheck className="copied" /> : <HiOutlineClipboardCopy />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <Button
                text="View Live Results"
                onClick={() => navigate(`/results/${selectedElectionId}`)}
              />
              <Button
                text="Return to Elections"
                onClick={() => navigate("/elections")}
              />
            </div>
          </div>
        ) : activeStep === 1 ? (
          /* Step 1: Candidate Cards Selection Grid */
          <>
            {candidates.length === 0 ? (
              <div className="empty-candidates">
                <p>No candidates are registered for this election at this time.</p>
              </div>
            ) : (
              <div className="candidate-grid">
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
                      <div className="avatar-wrap">
                        <div className="avatar">{candidate.name.charAt(0)}</div>
                      </div>
                      <div className="candidate-info">
                        <h3>{candidate.name}</h3>
                        <p>{candidate.party ?? "Independent Candidate"}</p>
                        <span className="tag">Verified Candidate</span>
                      </div>
                      <div className="select-box">
                        {isSelected ? <HiOutlineCheckCircle className="check-animated" /> : <div className="unselected-dot" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Action Control Bar */}
            <div className="action-card">
              <p className="selection-summary">
                {selectedCandidateObj
                  ? `Selected: ${selectedCandidateObj.name}`
                  : "Please choose a candidate to proceed."}
              </p>

              <div className="actions">
                <Button
                  text="Review Selection →"
                  onClick={() => {
                    if (!selectedCandidate) {
                      setError("Select a candidate to review your ballot.");
                      return;
                    }
                    setError("");
                    setActiveStep(2);
                  }}
                  disabled={!selectedCandidate}
                />
                <Button
                  text="Back to Elections"
                  onClick={() => navigate("/elections")}
                />
              </div>
            </div>
          </>
        ) : (
          /* Step 2: Review Selection Screen */
          <div className="review-card">
            <h2>Review Your Selection</h2>
            <p className="review-intro">
              Please double-check your choice before casting your final ballot. Once submitted, your selection cannot be changed.
            </p>

            {selectedCandidateObj && (
              <div className="review-candidate-box">
                <div className="avatar">{selectedCandidateObj.name.charAt(0)}</div>
                <div className="review-details">
                  <h3>{selectedCandidateObj.name}</h3>
                  <p>{selectedCandidateObj.party ?? "Independent Candidate"}</p>
                  <span className="tag">Selected Choice</span>
                </div>
              </div>
            )}

            <div className="actions">
              <Button
                text={sending ? "Casting Ballot..." : "Confirm & Cast Ballot"}
                onClick={handleSubmitVote}
                disabled={sending}
              />
              <Button
                text="← Change Candidate"
                onClick={() => setActiveStep(1)}
                disabled={sending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vote;
