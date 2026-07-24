import { useEffect, useState, type FormEvent } from "react";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineDocumentDownload,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi";
import Button from "../../common/Button/Button";
import { electionService } from "../../services/electionService";
import { candidateService } from "../../services/candidateService";
import { reportService } from "../../services/reportService";
import { userService } from "../../services/userService";
import type { Election } from "../../types/election";
import type { User } from "../../types/auth";
import styles from "./AdminElections.module.css";

interface CandidateDraft {
  memberId: number | null;
}

const AdminElections = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);

  // Member dropdown draft state
  const [candidateDrafts, setCandidateDrafts] = useState<CandidateDraft[]>([
    { memberId: null },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [electionsData, membersData] = await Promise.all([
        electionService.getAll(),
        userService.getMembers().catch((): User[] => []),
      ]);
      setElections(electionsData);
      setMembers(membersData);
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

  const handleAddCandidateRow = () => {
    setCandidateDrafts((current) => [...current, { memberId: null }]);
  };

  const handleRemoveCandidateRow = (index: number) => {
    setCandidateDrafts((current) => current.filter((_, i) => i !== index));
  };

  const handleCandidateMemberChange = (index: number, memberIdStr: string) => {
    const memberId = memberIdStr ? Number(memberIdStr) : null;
    setCandidateDrafts((current) =>
      current.map((draft, i) => (i === index ? { memberId } : draft)),
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

    try {
      // Step 1: Create the election via API
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

      // Step 2: Attach selected organization members as candidates
      const selectedMemberIds = candidateDrafts
        .map((c) => c.memberId)
        .filter((id): id is number => id !== null);

      const uniqueMemberIds = Array.from(new Set(selectedMemberIds));

      for (const memberId of uniqueMemberIds) {
        const member = members.find((m) => m.id === memberId);
        if (!member) continue;

        const fullName =
          [member.firstName, member.lastName].filter(Boolean).join(" ") ||
          member.username ||
          `Member #${member.id}`;

        await candidateService.addCandidate({
          name: fullName,
          party: member.email,
          voteCount: 0,
          electionId: createdElectionId,
          organizationId: member.organizationId
            ? Number(member.organizationId)
            : undefined,
        });
      }

      setElections((current) => [created, ...current]);
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setActive(true);
      setCandidateDrafts([{ memberId: null }]);
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
              Create active elections and assign existing organization members
              as candidates in a single flow.
            </p>
          </div>
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
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary or scope of this election"
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

          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span>Activate immediately upon creation</span>
          </label>

          {/* Member Selection Section */}
          <div className={styles.candidateSection}>
            <div className={styles.candidateHeader}>
              <div className={styles.sectionTitle}>
                <HiOutlineUserGroup className={styles.sectionIcon} />
                <h3>Assign Candidates</h3>
              </div>
              <p className={styles.muted}>
                Select registered organization members to participate in this
                election.
              </p>
            </div>

            <div className={styles.candidateList}>
              {candidateDrafts.map((draft, index) => (
                <div key={index} className={styles.candidateRow}>
                  <div className={styles.selectWrapper}>
                    <select
                      value={draft.memberId ?? ""}
                      onChange={(e) =>
                        handleCandidateMemberChange(index, e.target.value)
                      }
                    >
                      <option value="">-- Select Member --</option>
                      {members.map((member) => {
                        const fullName =
                          [member.firstName, member.lastName]
                            .filter(Boolean)
                            .join(" ") || member.username;
                        return (
                          <option key={member.id} value={member.id}>
                            {fullName} ({member.email})
                          </option>
                        );
                      })}
                    </select>
                  </div>

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
            </div>

            <button
              type="button"
              className={styles.addCandidateBtn}
              onClick={handleAddCandidateRow}
            >
              <HiOutlinePlus /> Add Another Candidate
            </button>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <Button
              text={
                saving ? "Creating..." : "Create Election & Assign Candidates"
              }
              type="submit"
              disabled={saving}
            />
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => void loadData()}
              title="Refresh data"
            >
              <HiOutlineRefresh /> Refresh
            </button>
          </div>
        </form>
      </section>

      {/* List Panel */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Managed Elections</h2>
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
          <div className={styles.list}>
            {elections.map((election) => (
              <div key={election.id} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.cardHeader}>
                    <strong className={styles.cardTitle}>
                      {election.title}
                    </strong>
                    <span
                      className={`${styles.statusBadge} ${
                        election.active
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    >
                      {election.active ? (
                        <HiOutlineCheckCircle />
                      ) : (
                        <HiOutlineXCircle />
                      )}
                      {election.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className={styles.cardDesc}>
                    {election.description ?? "No description provided."}
                  </p>

                  {(election.startDate || election.endDate) && (
                    <div className={styles.cardMeta}>
                      <HiOutlineCalendar />
                      <span>
                        {election.startDate
                          ? new Date(election.startDate).toLocaleDateString()
                          : "Immediate"}{" "}
                        &mdash;{" "}
                        {election.endDate
                          ? new Date(election.endDate).toLocaleDateString()
                          : "No end date"}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={
                      election.active
                        ? styles.btnDeactivate
                        : styles.btnActivate
                    }
                    onClick={() => void handleToggleActive(election)}
                  >
                    {election.active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    className={styles.btnExport}
                    onClick={() => void handleExportPdf(election.id)}
                    disabled={exportingId === election.id}
                  >
                    <HiOutlineDocumentDownload /> PDF
                  </button>

                  <button
                    type="button"
                    className={styles.btnExport}
                    onClick={() => void handleExportExcel(election.id)}
                    disabled={exportingId === election.id}
                  >
                    <HiOutlineDocumentDownload /> Excel
                  </button>

                  <button
                    type="button"
                    className={styles.btnDelete}
                    onClick={() => void handleDelete(election.id)}
                    title="Delete election"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminElections;
