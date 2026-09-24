import { useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../types/auth";
import type { Organization } from "../../types/organization";
import styles from "./AdminDashboard.module.css";

interface MembersTableProps {
  members: User[];
  organizations: Organization[];
  loading: boolean;
  updatingMemberId: number | null;
  onUpdateStatus: (memberId: number, currentStatus: string) => void;
}

const MembersTable = ({
  members,
  organizations,
  loading,
  updatingMemberId,
  onUpdateStatus,
}: MembersTableProps) => {
  const { user: currentUser } = useAuth();
  const [memberSearch, setMemberSearch] = useState("");

  const orgLookup = useMemo(
    () => new Map(organizations.map((org) => [org.id, org.name])),
    [organizations],
  );

  const filteredMembers = useMemo(() => {
    // Exclude admin users: only display regular organization members/users
    const regularMembers = members.filter((m) => {
      const role = (m.role ?? "").toUpperCase();
      const isAdminRole = role.includes("ADMIN") || role === "ORGANIZATION_ADMIN";
      const isCurrentAdmin = currentUser && (m.id === currentUser.id || m.username === currentUser.username);
      return !isAdminRole && !isCurrentAdmin;
    });

    if (!memberSearch.trim()) return regularMembers;
    const term = memberSearch.toLowerCase();
    return regularMembers.filter((m) => {
      const name = [m.firstName, m.lastName].filter(Boolean).join(" ").toLowerCase();
      const email = (m.email ?? "").toLowerCase();
      const username = (m.username ?? "").toLowerCase();
      return name.includes(term) || email.includes(term) || username.includes(term);
    });
  }, [members, memberSearch, currentUser]);

  return (
    <section className={styles.tablePanel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Registered Organization Members</h2>
          <p className={styles.muted}>
            Comprehensive telemetry of registered members, organization mapping, and status management.
          </p>
        </div>
        <div className={styles.panelHeaderRight}>
          <div className={styles.searchBox}>
            <HiOutlineSearch />
            <input
              type="text"
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
          </div>
          <span className={styles.tableCountBadge}>
            {filteredMembers.length} {filteredMembers.length === 1 ? "Member" : "Members"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading member directory…</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className={styles.emptyState}>
          {memberSearch
            ? "No matching members found."
            : "No members registered yet in the system."}
        </div>
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>MEMBER NAME</th>
                <th>EMAIL ADDRESS</th>
                <th>ORGANIZATION NAME</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const fullName =
                  [member.firstName, member.lastName].filter(Boolean).join(" ") ||
                  member.username;
                const initial = (fullName || "U").charAt(0).toUpperCase();
                const orgName = member.organizationId
                  ? orgLookup.get(member.organizationId) ?? `Org #${member.organizationId}`
                  : "Global Platform";
                const statusLabel = member.status ? member.status : "ACTIVE";

                return (
                  <tr key={member.id}>
                    <td className={styles.titleCell}>
                      <div className={styles.userRow}>
                        <div className={styles.userAvatar}>{initial}</div>
                        <div>
                          <strong>{fullName}</strong>
                          {member.username && member.username !== fullName && (
                            <div className={styles.subtext}>@{member.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={styles.descCell}>{member.email}</td>
                    <td>
                      <span className={`${styles.statusPill} ${styles.pillActive}`}>
                        {orgName}
                      </span>
                    </td>
                    <td className={styles.timeCell}>
                      <span
                        className={`${styles.statusPill} ${
                          statusLabel.toUpperCase() === "ACTIVE"
                            ? styles.pillActive
                            : styles.pillEnded
                        }`}
                      >
                        <span className={styles.pillDot} />
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.tableActionButton}
                        disabled={updatingMemberId === member.id}
                        onClick={() => onUpdateStatus(member.id, statusLabel)}
                      >
                        {updatingMemberId === member.id
                          ? "Updating..."
                          : statusLabel === "ACTIVE"
                          ? "Restrict"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default MembersTable;
