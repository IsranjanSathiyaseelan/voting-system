import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineDocumentDownload,
  HiOutlineCalendar,
} from "react-icons/hi";
import Button from "../../common/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { electionService } from "../../services/electionService";
import { candidateService } from "../../services/candidateService";
import { reportService } from "../../services/reportService";
import type { Election } from "../../types/election";
import type { Candidate } from "../../types/candidate";
import styles from "./AdminElections.module.css";

interface CandidateDraft {
  candidateId: number | null;
}

const AdminElections = () => {
  const { user: currentUser } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);

  // Candidate dropdown draft state
  const [candidateDrafts, setCandidateDrafts] = useState<CandidateDraft[]>([
    { candidateId: null },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [electionsData, candidatesData] = await Promise.all([
        electionService.getAll(),
        candidateService.getCandidates().catch((): Candidate[] => []),
      ]);
      setElections(electionsData);
      setCandidates(candidatesData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load required election data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Filter candidates for assignment: exclude admins, only show candidates belonging to the admin's organization
  const assignableCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      // Must belong to the admin's organization
      if (currentUser?.organizationId && candidate.organizationId) {
        if (
          String(candidate.organizationId) !==
          String(currentUser.organizationId)
        ) {
          return false;
        }
      }

      // Exclude admin users
      if (currentUser) {
        const cName = (candidate.name ?? "").trim().toLowerCase();
        const adminUsername = (currentUser.username ?? "").trim().toLowerCase();
        const adminEmail = (currentUser.email ?? "").trim().toLowerCase();
        const adminFullName =
          `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`
            .trim()
            .toLowerCase();
        if (adminUsername && cName === adminUsername) return false;
        if (adminFullName && cName === adminFullName) return false;
        if (
          candidate.party &&
          adminEmail &&
          candidate.party.trim().toLowerCase() === adminEmail
        )
          return false;
      }
      return true;
    });
  }, [candidates, currentUser]);

  const handleAddCandidateRow = () => {
    setCandidateDrafts((current) => [...current, { candidateId: null }]);
  };

  const handleRemoveCandidateRow = (index: number) => {
    setCandidateDrafts((current) => current.filter((_, i) => i !== index));
  };

  const handleCandidateChange = (index: number, candidateIdStr: string) => {
    const candidateId = candidateIdStr ? Number(candidateIdStr) : null;
    setCandidateDrafts((current) =>
      current.map((draft, i) => (i === index ? { candidateId } : draft)),
    );
  };

  const handleCreateElection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Enter an election title.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const created = await electionService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate
          ? new Date(startDate).toISOString().slice(0, 19)
          : undefined,
        endDate: endDate
          ? new Date(endDate).toISOString().slice(0, 19)
          : undefined,
        active,
      });

      const createdElectionId = created.id ?? (created as { id?: number }).id;

      if (!createdElectionId) {
        throw new Error("Created election did not return a valid ID.");
      }

      const selectedCandidateIds = candidateDrafts
        .map((c) => c.candidateId)
        .filter((id): id is number => id !== null);

      const uniqueCandidateIds = Array.from(new Set(selectedCandidateIds));

      for (const candidateId of uniqueCandidateIds) {
        const candidate =
          assignableCandidates.find((c) => c.id === candidateId) ||
          candidates.find((c) => c.id === candidateId);
        if (!candidate) continue;

        try {
          await candidateService.assignCandidate(
            candidateId,
            createdElectionId,
          );
        } catch {
          await candidateService.addCandidate({
            name: candidate.name,
            party: candidate.party,
            voteCount: 0,
            electionId: createdElectionId,
            organizationId: currentUser?.organizationId
              ? Number(currentUser.organizationId)
              : undefined,
          });
        }
      }

      setElections((current) => [created, ...current]);
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setActive(true);
      setCandidateDrafts([{ candidateId: null }]);
      setSuccess("Election created and candidates successfully assigned!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create election and assign candidates.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (election: Election) => {
    setError("");
    setSuccess("");

    try {
      const updated = await electionService.update(election.id, {
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        active: !election.active,
      });

      setElections((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update election status.",
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this election?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await electionService.delete(id);
      setElections((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete election.",
      );
    }
  };

  const handleExportPdf = async (electionId: number) => {
    setExportingId(electionId);
    try {
      await reportService.exportPdf(electionId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export PDF report.",
      );
    } finally {
      setExportingId(null);
    }
  };

  const handleExportExcel = async (electionId: number) => {
    setExportingId(electionId);
    try {
      await reportService.exportExcel(electionId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export Excel report.",
      );
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className={styles.page}>
      {/* Creation Panel */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h1>Elections &amp; Voting Events</h1>
            <p className={styles.muted}>
              Create elections and assign organization members as candidates.
            </p>
          </div>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => void loadData()}
            title="Refresh data"
          >
            <HiOutlineRefresh /> <span>Refresh</span>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleCreateElection}>
          <div className={styles.formGrid}>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Election Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2026 Presidential Election"
                required
              />
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary or scope of this election"
                rows={2}
              />
            </label>

            <label className={styles.field}>
              <span>Start Date &amp; Time</span>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>End Date &amp; Time</span>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span className={styles.toggleLabel}>
              Activate immediately upon creation
            </span>
          </label>

          {/* Candidate Selection Section */}
          <div className={styles.candidateDraftSection}>
            <div className={styles.candidateDraftHeader}>
              <h3>Assign Candidates</h3>
            </div>

            {candidateDrafts.map((draft, index) => (
              <div key={index} className={styles.candidateRow}>
                <select
                  className={styles.candidateSelect}
                  value={draft.candidateId ?? ""}
                  onChange={(e) => handleCandidateChange(index, e.target.value)}
                >
                  <option value="">Select Candidate</option>
                  {assignableCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}{" "}
                      {candidate.party ? `(${candidate.party})` : ""}
                    </option>
                  ))}
                </select>

                {candidateDrafts.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemoveCandidateRow(index)}
                    title="Remove candidate"
                  >
                    <HiOutlineTrash />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAddCandidateRow}
            >
              <HiOutlinePlus /> Add Another Candidate
            </button>
          </div>

          {error ? <div className={styles.errorAlert}>{error}</div> : null}
          {success ? (
            <div className={styles.successAlert}>{success}</div>
          ) : null}

          <div className={styles.actions}>
            <Button
              text={
                saving ? "Creating..." : "Create Election & Assign Candidates"
              }
              type="submit"
              disabled={saving}
            />
          </div>
        </form>
      </section>

      {/* List / Table Panel */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Managed Elections</h2>
            <p className={styles.muted}>
              Overview of active and historical voting schedules.
            </p>
          </div>
          <span className={styles.countBadge}>{elections.length} Total</span>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading elections...</div>
        ) : elections.length === 0 ? (
          <div className={styles.emptyState}>
            No elections created yet. Use the form above to establish your first
            election.
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((election) => (
                  <tr key={election.id}>
                    <td className={styles.titleCell}>
                      <strong>{election.title}</strong>
                    </td>
                    <td className={styles.descCell}>
                      {election.description ?? "No description provided."}
                    </td>
                    <td>
                      {election.startDate || election.endDate ? (
                        <span className={styles.scheduleBadge}>
                          <HiOutlineCalendar size={14} />
                          {election.startDate
                            ? new Date(election.startDate).toLocaleDateString()
                            : "Immediate"}{" "}
                          &mdash;{" "}
                          {election.endDate
                            ? new Date(election.endDate).toLocaleDateString()
                            : "No end"}
                        </span>
                      ) : (
                        <span className={styles.mutedText}>Not scheduled</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusPill} ${
                          election.active ? styles.pillActive : styles.pillEnded
                        }`}
                      >
                        <span className={styles.pillDot} />
                        {election.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => void handleToggleActive(election)}
                        >
                          {election.active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => void handleExportPdf(election.id)}
                          disabled={exportingId === election.id}
                          title="Export PDF Report"
                        >
                          <HiOutlineDocumentDownload /> PDF
                        </button>

                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => void handleExportExcel(election.id)}
                          disabled={exportingId === election.id}
                          title="Export Excel Report"
                        >
                          <HiOutlineDocumentDownload /> Excel
                        </button>

                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                          onClick={() => void handleDelete(election.id)}
                          title="Delete election"
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminElections;
