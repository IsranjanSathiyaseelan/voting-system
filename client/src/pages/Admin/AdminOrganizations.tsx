import { useEffect, useState } from "react";
import { HiOutlineOfficeBuilding, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh } from "react-icons/hi";
import Button from "../../common/Button/Button";
import { organizationService } from "../../services/organizationService";
import type { Organization } from "../../types/organization";
import styles from "./AdminSections.module.css";

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editingOrganizationId, setEditingOrganizationId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadOrganizations = async () => {
    setLoading(true);
    setError("");

    try {
      setOrganizations(await organizationService.getAll());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load organizations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrganizations();
  }, []);

  const beginEdit = (org: Organization) => {
    setEditingOrganizationId(org.id);
    setEditingName(org.name);
    setEditingDescription(org.description ?? "");
  };

  const cancelEdit = () => {
    setEditingOrganizationId(null);
    setEditingName("");
    setEditingDescription("");
  };

  const handleSaveEdit = async () => {
    if (!editingOrganizationId) return;
    if (!editingName.trim()) {
      setError("Organization name cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated = await organizationService.update(editingOrganizationId, {
        name: editingName.trim(),
        description: editingDescription.trim() || undefined,
      });

      setOrganizations((current) =>
        current.map((org) => (org.id === updated.id ? updated : org)),
      );
      cancelEdit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update organization.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this organization and its associated records?")) {
      return;
    }

    setError("");

    try {
      await organizationService.delete(id);
      setOrganizations((current) => current.filter((org) => org.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete organization.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h1>Organizations</h1>
            <p className={styles.muted}>Manage voting institutions and groups.</p>
          </div>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => void loadOrganizations()}
            title="Refresh organizations"
          >
            <HiOutlineRefresh /> Refresh
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <div className={styles.emptyState}>Loading organizations...</div>
        ) : organizations.length === 0 ? (
          <div className={styles.emptyState}>
            No organizations found.
          </div>
        ) : (
          <div className={styles.list}>
            {organizations.map((org) => (
              <div key={org.id} className={styles.card}>
                {editingOrganizationId === org.id ? (
                  <div className={styles.editFormContainer}>
                    <div className={styles.formGrid}>
                      <label className={`${styles.field} ${styles.fullWidth}`}>
                        <span>Organization Name</span>
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Enter organization name"
                          required
                        />
                      </label>
                      <label className={`${styles.field} ${styles.fullWidth}`}>
                        <span>Description</span>
                        <input
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Brief summary of the organization"
                        />
                      </label>
                    </div>
                    <div className={styles.actions} style={{ marginTop: "1rem" }}>
                      <Button
                        text={saving ? "Saving..." : "Save Changes"}
                        onClick={() => void handleSaveEdit()}
                        disabled={saving}
                      />
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.cardMain}>
                      <div className={styles.cardHeader}>
                        <div className={styles.sectionTitle}>
                          <HiOutlineOfficeBuilding className={styles.sectionIcon} />
                          <strong className={styles.cardTitle}>{org.name}</strong>
                        </div>
                      </div>
                      <p className={styles.cardDesc}>
                        {org.description ?? "No description provided."}
                      </p>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.btnExport}
                        onClick={() => beginEdit(org)}
                        title="Edit organization"
                      >
                        <HiOutlinePencil /> Edit
                      </button>
                      <button
                        type="button"
                        className={styles.btnDelete}
                        onClick={() => void handleDelete(org.id)}
                        title="Delete organization"
                      >
                        <HiOutlineTrash /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminOrganizations;