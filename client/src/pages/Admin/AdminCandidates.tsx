import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "../../common/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { candidateService } from "../../services/candidateService";
import { organizationService } from "../../services/organizationService";
import { electionService } from "../../services/electionService";
import type { Candidate } from "../../types/candidate";
import type { Organization } from "../../types/organization";
import type { Election } from "../../types/election";
import styles from "./AdminSections.module.css";

const AdminCandidates = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [candidateElectionId, setCandidateElectionId] = useState<
    number | ""
  >("");
  const [loading, setLoading] = useState(true);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const organizationLookup = useMemo(
    () =>
      new Map(
        organizations.map((organization) => [organization.id, organization]),
      ),
    [organizations],
  );

  const electionLookup = useMemo(
    () =>
      new Map(
        elections.map((election) => [election.id, election]),
      ),
    [elections],
  );

  const loadCandidatesData = async () => {
    setLoading(true);
    setError("");

    try {
      const [organizationData, electionData, candidateData] = await Promise.all([
        organizationService.getAll().catch(() => [] as Organization[]),
        electionService.getAll().catch(() => [] as Election[]),
        candidateService.getCandidates().catch(() => [] as Candidate[]),
      ]);

      setOrganizations(organizationData);
      setElections(electionData);
      setCandidates(candidateData);

      if (candidateElectionId === "" && electionData.length > 0) {
        setCandidateElectionId(electionData[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load candidates data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCandidatesData();
  }, []);

  const handleAddCandidate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!candidateName.trim()) {
      setError("Enter a candidate name.");
      return;
    }

    setSavingCandidate(true);
    setError("");
    setSuccessMsg("");

    try {
      const created = await candidateService.addCandidate({
        name: candidateName.trim(),
        party: candidateParty.trim() || undefined,
        voteCount: 0,
        organizationId: user?.organizationId ? Number(user.organizationId) : undefined,
        electionId: candidateElectionId !== "" ? candidateElectionId : undefined,
      });

      setCandidates((current) => [created, ...current]);
      setCandidateName("");
      setCandidateParty("");
      setSuccessMsg(`Candidate "${created.name}" created successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add candidate.");
    } finally {
      setSavingCandidate(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    const orgCandidates = candidates.filter((c) => {
      if (!user?.organizationId) return true;
      return !c.organizationId || String(c.organizationId) === String(user.organizationId);
    });

    if (!searchQuery.trim()) return orgCandidates;
    const term = searchQuery.toLowerCase();
    return orgCandidates.filter((c) => {
      const party = (c.party ?? "").toLowerCase();
      const electionTitle = (c.electionId ? electionLookup.get(c.electionId)?.title ?? "" : "").toLowerCase();
      return c.name.toLowerCase().includes(term) || party.includes(term) || electionTitle.includes(term);
    });
  }, [candidates, searchQuery, electionLookup, user]);

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <h1>Candidate Management</h1>
        <p className={styles.muted}>
          Register candidates for upcoming elections, assign organization telemetry, and monitor live voting metrics.
        </p>

        {successMsg && <p className={styles.success}>{successMsg}</p>}
        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleAddCandidate}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Candidate Name</span>
              <input
                value={candidateName}
                onChange={(event) => setCandidateName(event.target.value)}
                placeholder="e.g. Jane Doe"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Party / Tagline</span>
              <input
                value={candidateParty}
                onChange={(event) => setCandidateParty(event.target.value)}
                placeholder="e.g. Innovation Alliance"
              />
            </label>
            {elections.length > 0 && (
              <label className={styles.field}>
                <span>Election (Optional)</span>
                <select
                  value={candidateElectionId}
                  onChange={(event) =>
                    setCandidateElectionId(
                      event.target.value === "" ? "" : Number(event.target.value),
                    )
                  }
                >
                  <option value="">Select Election</option>
                  {elections.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.title} {election.active ? "(Active)" : "(Inactive)"}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className={styles.actions}>
            <Button
              text={savingCandidate ? "Adding..." : "Add Candidate"}
              type="submit"
              disabled={savingCandidate}
            />
            <Button
              text="Refresh"
              onClick={() => {
                void loadCandidatesData();
              }}
            />
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2>Current Candidates ({candidates.length})</h2>
            <p className={styles.muted}>Active candidate roster across all platform elections.</p>
          </div>
          <div className={styles.field} style={{ margin: 0, textTransform: "none" }}>
            <input
              type="text"
              placeholder="Search candidate name, party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "240px", minHeight: "38px", padding: "8px 14px", fontSize: "0.85rem" }}
            />
          </div>
        </div>

        {loading ? (
          <p className={styles.muted} style={{ marginTop: "16px" }}>Loading candidate roster…</p>
        ) : filteredCandidates.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? "No matching candidates found." : "No candidates have been added yet."}
          </div>
        ) : (
          <div className={styles.list}>
            {filteredCandidates.map((candidate) => {
              const initial = candidate.name.charAt(0).toUpperCase();
              const orgName = candidate.organizationId
                ? organizationLookup.get(candidate.organizationId)?.name
                : undefined;
              const electionTitle = candidate.electionId
                ? electionLookup.get(candidate.electionId)?.title
                : undefined;

              return (
                <div key={candidate.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.candidateAvatar}>{initial}</div>
                    <div>
                      <strong>{candidate.name}</strong>
                      {candidate.party && <span className={styles.partyTag}>{candidate.party}</span>}
                      <p>
                        {electionTitle ? `Election: ${electionTitle}` : orgName ? `Org: ${orgName}` : "General Candidate"}
                      </p>
                    </div>
                  </div>
                  <span className={styles.voteBadge}>
                    {candidate.voteCount} {candidate.voteCount === 1 ? "vote" : "votes"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminCandidates;
