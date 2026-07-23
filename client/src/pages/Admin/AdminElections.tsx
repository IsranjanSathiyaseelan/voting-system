import { useEffect, useState, type FormEvent } from "react";
import Button from "../../common/Button/Button";
import { electionService } from "../../services/electionService";
import { candidateService } from "../../services/candidateService";
import { reportService } from "../../services/reportService";
import type { Election } from "../../types/election";
import styles from "./AdminSections.module.css";

interface CandidateDraft {
  name: string;
  party: string;
}

const AdminElections = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);

  // Inline candidates draft list
  const [candidateDrafts, setCandidateDrafts] = useState<CandidateDraft[]>([
    { name: "", party: "" },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadElections = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await electionService.getAll();
      setElections(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load elections.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadElections();
  }, []);

  const handleAddCandidateRow = () => {
    setCandidateDrafts((current) => [...current, { name: "", party: "" }]);
  };

  const handleRemoveCandidateRow = (index: number) => {
    setCandidateDrafts((current) => current.filter((_, i) => i !== index));
  };

  const handleCandidateChange = (
    index: number,
    field: "name" | "party",
    value: string,
  ) => {
    setCandidateDrafts((current) =>
      current.map((draft, i) =>
        i === index ? { ...draft, [field]: value } : draft,
      ),
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
      // Step 1: Create the election
      const created = await electionService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate ? new Date(startDate).toISOString().slice(0, 19) : undefined,
        endDate: endDate ? new Date(endDate).toISOString().slice(0, 19) : undefined,
        active,
      });

      // Step 2: Add valid candidate entries sequentially attached to election.id
      const validCandidates = candidateDrafts.filter((c) => c.name.trim() !== "");
      for (const candidate of validCandidates) {
        await candidateService.addCandidate({
          name: candidate.name.trim(),
          party: candidate.party.trim() || undefined,
          voteCount: 0,
          electionId: created.id,
        });
      }

      setElections((current) => [created, ...current]);
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setActive(true);
      setCandidateDrafts([{ name: "", party: "" }]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create election and candidates.",
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
        err instanceof Error ? err.message : "Unable to update election status.",
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
      setError(err instanceof Error ? err.message : "Failed to export PDF report.");
    } finally {
      setExportingId(null);
    }
  };

  const handleExportExcel = async (electionId: number) => {
    setExportingId(electionId);
    try {
      await reportService.exportExcel(electionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export Excel report.");
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <h1>Elections &amp; Voting Events</h1>
        <p className={styles.muted}>
          Create and manage active elections and candidate slates for your organization in a single unified flow.
        </p>

        <form className={styles.form} onSubmit={handleCreateElection}>
          <label className={styles.field}>
            <span>Election Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2026 Presidential Election"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or purpose of this election"
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

          <label className={styles.field} style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ width: "auto" }}
            />
            <span>Active immediately upon creation</span>
          </label>

          {/* Inline Candidates Section */}
          <div style={{ marginTop: "16px", padding: "16px", background: "#0f172a", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "0.95rem", color: "#f8fafc" }}>
              Election Candidates (Optional)
            </h3>
            <p className={styles.muted} style={{ margin: "0 0 14px", fontSize: "0.85rem" }}>
              Add candidates directly to this election before submitting.
            </p>

            {candidateDrafts.map((draft, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  placeholder="Candidate Name"
                  value={draft.name}
                  onChange={(e) => handleCandidateChange(index, "name", e.target.value)}
                  style={{
                    flex: "1",
                    minWidth: "160px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
                <input
                  placeholder="Party / Tagline (Optional)"
                  value={draft.party}
                  onChange={(e) => handleCandidateChange(index, "party", e.target.value)}
                  style={{
                    flex: "1",
                    minWidth: "160px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
                {candidateDrafts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCandidateRow(index)}
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#f87171",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddCandidateRow}
              style={{
                marginTop: "6px",
                background: "rgba(59, 130, 246, 0.15)",
                color: "#60a5fa",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "8px",
                padding: "8px 14px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              + Add Candidate Entry
            </button>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions} style={{ marginTop: "16px" }}>
            <Button
              text={saving ? "Creating..." : "Create Election & Candidates"}
              type="submit"
              disabled={saving}
            />
            <Button
              text="Refresh"
              onClick={() => {
                void loadElections();
              }}
            />
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>Managed Elections</h2>
        {loading ? (
          <p className={styles.muted}>Loading elections…</p>
        ) : elections.length === 0 ? (
          <div className={styles.emptyState}>
            No elections have been created yet.
          </div>
        ) : (
          <div className={styles.list}>
            {elections.map((election) => (
              <div key={election.id} className={styles.card}>
                <div>
                  <strong>{election.title}</strong>
                  <p>{election.description ?? "No description provided."}</p>
                  <small className={styles.muted}>
                    Status: {election.active ? "🟢 Active" : "🔴 Inactive"}
                  </small>
                </div>
                <div className={styles.actions}>
                  <Button
                    text={election.active ? "Deactivate" : "Activate"}
                    onClick={() => void handleToggleActive(election)}
                  />
                  <Button
                    text={exportingId === election.id ? "Exporting..." : "PDF Report"}
                    onClick={() => void handleExportPdf(election.id)}
                    disabled={exportingId === election.id}
                  />
                  <Button
                    text={exportingId === election.id ? "Exporting..." : "Excel Report"}
                    onClick={() => void handleExportExcel(election.id)}
                    disabled={exportingId === election.id}
                  />
                  <Button
                    text="Delete"
                    onClick={() => void handleDelete(election.id)}
                  />
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
