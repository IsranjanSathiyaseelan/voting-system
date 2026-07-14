import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "../../common/Button/Button";
import { candidateService } from "../../services/candidateService";
import { organizationService } from "../../services/organizationService";
import type { Candidate } from "../../types/candidate";
import type { Organization } from "../../types/organization";
import styles from "./AdminSections.module.css";

const AdminCandidates = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [candidateOrganizationId, setCandidateOrganizationId] = useState<
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

  const loadCandidates = async () => {
    setLoading(true);
    setError("");

    try {
      const [organizationData, candidateData] = await Promise.all([
        organizationService.getAll(),
        candidateService.getCandidates(),
      ]);

      setOrganizations(organizationData);
      setCandidates(candidateData);

      if (candidateOrganizationId === "" && organizationData.length > 0) {
        setCandidateOrganizationId(organizationData[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load candidates.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCandidates();
  }, []);

  const handleAddCandidate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!candidateName.trim()) {
      setError("Enter a candidate name.");
      return;
    }

    if (candidateOrganizationId === "") {
      setError("Select an organization for this candidate.");
      return;
    }

    setSavingCandidate(true);
    setError("");

    try {
      const created = await candidateService.addCandidate({
        name: candidateName.trim(),
        voteCount: 0,
        organizationId: candidateOrganizationId,
      });

      setCandidates((current) => [created, ...current]);
      setCandidateName("");
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
          Attach candidates to organizations and review their totals.
        </p>

        <form className={styles.form} onSubmit={handleAddCandidate}>
          <label className={styles.field}>
            <span>Candidate name</span>
            <input
              value={candidateName}
              onChange={(event) => setCandidateName(event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Organization</span>
            <select
              value={candidateOrganizationId}
              onChange={(event) =>
                setCandidateOrganizationId(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
            >
              <option value="">Select organization</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <Button
              text={savingCandidate ? "Adding..." : "Add candidate"}
              type="submit"
              disabled={savingCandidate || organizations.length === 0}
            />
            <Button
              text="Refresh"
              onClick={() => {
                void loadCandidates();
              }}
            />
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>Current candidates</h2>
        {loading ? (
          <p className={styles.muted}>Loading candidates…</p>
        ) : candidates.length === 0 ? (
          <div className={styles.emptyState}>
            No candidates have been added yet.
          </div>
        ) : (
          <div className={styles.list}>
            {candidates.map((candidate) => (
              <div key={candidate.id} className={styles.card}>
                <div>
                  <strong>{candidate.name}</strong>
                  <p>
                    {organizationLookup.get(candidate.organizationId)?.name ??
                      "Unknown organization"}
                  </p>
                </div>
                <span className={styles.voteBadge}>
                  {candidate.voteCount} votes
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminCandidates;
