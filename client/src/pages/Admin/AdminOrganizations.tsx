import { useEffect, useState, type FormEvent } from "react";
import Button from "../../common/Button/Button";
import { organizationService } from "../../services/organizationService";
import type { Organization } from "../../types/organization";
import styles from "./AdminSections.module.css";

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationDescription, setOrganizationDescription] = useState("");
  const [organizationIcon, setOrganizationIcon] = useState("");
  const [editingOrganizationId, setEditingOrganizationId] = useState<
    number | null
  >(null);
  const [editingOrganizationName, setEditingOrganizationName] = useState("");
  const [editingOrganizationDescription, setEditingOrganizationDescription] =
    useState("");
  const [editingOrganizationIcon, setEditingOrganizationIcon] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingOrganization, setSavingOrganization] = useState(false);
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

  const handleCreateOrganization = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!organizationName.trim()) {
      setError("Enter an organization name.");
      return;
    }

    setSavingOrganization(true);
    setError("");

    try {
      const created = await organizationService.create({
        name: organizationName.trim(),
        description: organizationDescription.trim() || undefined,
        icon: organizationIcon.trim() || undefined,
      });
      setOrganizations((current) => [created, ...current]);
      setOrganizationName("");
      setOrganizationDescription("");
      setOrganizationIcon("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create organization.",
      );
    } finally {
      setSavingOrganization(false);
    }
  };

  const beginEdit = (organization: Organization) => {
    setEditingOrganizationId(organization.id);
    setEditingOrganizationName(organization.name);
    setEditingOrganizationDescription(organization.description ?? "");
    setEditingOrganizationIcon(organization.icon ?? "");
  };

  const cancelEdit = () => {
    setEditingOrganizationId(null);
    setEditingOrganizationName("");
    setEditingOrganizationDescription("");
    setEditingOrganizationIcon("");
  };

  const handleSaveEdit = async () => {
    if (!editingOrganizationId) return;
    if (!editingOrganizationName.trim()) {
      setError("Enter an organization name.");
      return;
    }

    setSavingOrganization(true);
    setError("");

    try {
      const updated = await organizationService.update(editingOrganizationId, {
        name: editingOrganizationName.trim(),
        description: editingOrganizationDescription.trim() || undefined,
        icon: editingOrganizationIcon.trim() || undefined,
      });

      setOrganizations((current) =>
        current.map((organization) =>
          organization.id === updated.id ? updated : organization,
        ),
      );
      cancelEdit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update organization.",
      );
    } finally {
      setSavingOrganization(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this organization and its candidates?")) {
      return;
    }

    setError("");

    try {
      await organizationService.delete(id);
      setOrganizations((current) =>
        current.filter((organization) => organization.id !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete organization.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <h1>Organizations</h1>
        <p className={styles.muted}>Create and manage voting organizations.</p>

        <form className={styles.form} onSubmit={handleCreateOrganization}>
          <label className={styles.field}>
            <span>Organization name</span>
            <input
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Description</span>
            <input
              value={organizationDescription}
              onChange={(event) =>
                setOrganizationDescription(event.target.value)
              }
            />
          </label>
          <label className={styles.field}>
            <span>Icon or logo</span>
            <input
              value={organizationIcon}
              onChange={(event) => setOrganizationIcon(event.target.value)}
            />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <Button
              text={savingOrganization ? "Saving..." : "Create organization"}
              type="submit"
              disabled={savingOrganization}
            />
            <Button
              text="Refresh"
              onClick={() => {
                void loadOrganizations();
              }}
            />
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>Existing organizations</h2>
        {loading ? (
          <p className={styles.muted}>Loading organizations…</p>
        ) : organizations.length === 0 ? (
          <div className={styles.emptyState}>
            No organizations have been created yet.
          </div>
        ) : (
          <div className={styles.list}>
            {organizations.map((organization) => (
              <div key={organization.id} className={styles.card}>
                {editingOrganizationId === organization.id ? (
                  <div className={styles.form}>
                    <label className={styles.field}>
                      <span>Name</span>
                      <input
                        value={editingOrganizationName}
                        onChange={(event) =>
                          setEditingOrganizationName(event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Description</span>
                      <input
                        value={editingOrganizationDescription}
                        onChange={(event) =>
                          setEditingOrganizationDescription(event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Icon or logo</span>
                      <input
                        value={editingOrganizationIcon}
                        onChange={(event) =>
                          setEditingOrganizationIcon(event.target.value)
                        }
                      />
                    </label>
                    <div className={styles.actions}>
                      <Button
                        text={savingOrganization ? "Saving..." : "Save"}
                        onClick={handleSaveEdit}
                        disabled={savingOrganization}
                      />
                      <Button text="Cancel" onClick={cancelEdit} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>{organization.name}</strong>
                      <p>
                        {organization.description ?? "No description provided"}
                      </p>
                    </div>
                    <div className={styles.actions}>
                      <Button
                        text="Edit"
                        onClick={() => beginEdit(organization)}
                      />
                      <Button
                        text="Delete"
                        onClick={() => {
                          void handleDelete(organization.id);
                        }}
                      />
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
