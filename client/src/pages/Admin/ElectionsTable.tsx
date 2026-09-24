import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";
import type { Election } from "../../types/election";
import styles from "./AdminDashboard.module.css";

interface ElectionsTableProps {
  elections: Election[];
}

const ElectionsTable = ({ elections }: ElectionsTableProps) => {
  const [electionSearch, setElectionSearch] = useState("");

  const filteredElections = useMemo(() => {
    if (!electionSearch.trim()) return elections;
    const term = electionSearch.toLowerCase();
    return elections.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        (e.description ?? "").toLowerCase().includes(term),
    );
  }, [elections, electionSearch]);

  return (
    <section className={styles.tablePanel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Active Elections &amp; Status Logs</h2>
          <p className={styles.muted}>
            Overview of active elections and registered candidate performance.
          </p>
        </div>
        <div className={styles.panelHeaderRight}>
          <div className={styles.searchBox}>
            <HiOutlineSearch />
            <input
              type="text"
              placeholder="Search elections..."
              value={electionSearch}
              onChange={(e) => setElectionSearch(e.target.value)}
            />
          </div>
          <span className={styles.tableCountBadge}>
            {filteredElections.length}{" "}
            {filteredElections.length === 1 ? "Election" : "Elections"}
          </span>
        </div>
      </div>

      {filteredElections.length === 0 ? (
        <div className={styles.emptyState}>
          {electionSearch
            ? "No matching elections found."
            : "No elections configured yet. Click 'Create Election' to add one."}
        </div>
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ELECTION TITLE</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>TIMEFRAME</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredElections.map((election) => (
                <tr key={election.id}>
                  <td className={styles.titleCell}>
                    <strong>{election.title}</strong>
                  </td>
                  <td className={styles.descCell}>
                    {election.description ?? "No description provided."}
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
                  <td className={styles.timeCell}>
                    {election.startDate
                      ? new Date(election.startDate).toLocaleDateString()
                      : "Ongoing"}
                  </td>
                  <td>
                    <Link to="/admin/elections" className={styles.tableActionButton}>
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ElectionsTable;
