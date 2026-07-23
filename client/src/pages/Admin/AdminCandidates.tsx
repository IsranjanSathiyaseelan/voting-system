import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "../../common/Button/Button";
import { candidateService } from "../../services/candidateService";
import { organizationService } from "../../services/organizationService";
import { electionService } from "../../services/electionService";
import type { Candidate } from "../../types/candidate";
import type { Organization } from "../../types/organization";
import type { Election } from "../../types/election";
import styles from "./AdminSections.module.css";

const AdminCandidates = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [candidateOrganizationId, setCandidateOrganizationId] = useState<
    number | ""
  >("");
  const [candidateElectionId, setCandidateElectionId] = useState<
    number | ""
  >("");
  const [loading, setLoading] = useState(true);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [error, setError] = useState("");

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

      if (candidateOrganizationId === "" && organizationData.length > 0) {
        setCandidateOrganizationId(organizationData[0].id);
      }
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

    try {
      const created = await candidateService.addCandidate({
        name: candidateName.trim(),
        party: candidateParty.trim() || undefined,
        voteCount: 0,
        organizationId: candidateOrganizationId !== "" ? candidateOrganizationId : undefined,
        electionId: candidateElectionId !== "" ? candidateElectionId : undefined,
      });

      setCandidates((current) => [created, ...current]);
      setCandidateName("");
      setCandidateParty("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add candidate.");
    } finally {
      setSavingCandidate(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <h1>Candidates</h1>
        <p className={styles.muted}>
          Attach candidates to active elections or organizations and track vote totals.
        </p>

        <form className={styles.form} onSubmit={handleAddCandidate}>
          <label className={styles.field}>
            <span>Candidate Name</span>
            <input
              value={candidateName}
              onChange={(event) => setCandidateName(event.target.value)}
              placeholder="Candidate Full Name"
              required
            />
          </label>
          <label className={styles.field}>
            <span>Party / Tagline</span>
            <input
              value={candidateParty}
              onChange={(event) => setCandidateParty(event.target.value)}
              placeholder="e.g. Independent, Tech Party"
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
          {organizations.length > 0 && (
            <label className={styles.field}>
              <span>Organization (Optional)</span>
              <select
                value={candidateOrganizationId}
                onChange={(event) =>
                  setCandidateOrganizationId(
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              >
                <option value="">Select Organization</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {error ? <p className={styles.error}>{error}</p> : null}
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
        <h2>Current Candidates</h2>
        {loading ? (
          <p className={styles.muted}>Loading candidates…</p>
        ) : candidates.length === 0 ? (
          <div className={styles.emptyState}>
            No candidates have been added yet.
          </div>
        ) : (
          <div className={styles.list}>
            {candidates.map((candidate) => {
              const orgName = candidate.organizationId
                ? organizationLookup.get(candidate.organizationId)?.name
                : undefined;
              const electionTitle = candidate.electionId
                ? electionLookup.get(candidate.electionId)?.title
                : undefined;

              return (
                <div key={candidate.id} className={styles.card}>
                  <div>
                    <strong>{candidate.name}</strong>
                    {candidate.party ? <p>Party: {candidate.party}</p> : null}
                    <p style={{ fontSize: "0.85rem" }}>
                      {electionTitle ? `Election: ${electionTitle}` : orgName ? `Org: ${orgName}` : "General Candidate"}
                    </p>
                  </div>
                  <span className={styles.voteBadge}>
                    {candidate.voteCount} votes
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
