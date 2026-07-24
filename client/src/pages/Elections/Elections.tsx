import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { electionService } from "../../services/electionService";
import { voteService } from "../../services/voteService";
import type { Election } from "../../types/election";
import styles from "./Elections.module.css";

type FilterTab = "all" | "active" | "voted" | "ended";

const Elections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    const loadElections = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await electionService.getAll().catch(() => [] as Election[]);
        setElections(data);

        if (user && user.id && data.length > 0) {
          const voteStatuses = await Promise.all(
            data.map(async (election) => {
              const status = await voteService
                .getElectionVoteStatus(user.id, election.id)
                .catch(() => ({ hasVoted: false }));

              return [election.id, status.hasVoted] as const;
            })
          );

          setVotedMap(Object.fromEntries(voteStatuses));
        } else {
          setVotedMap({});
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load elections."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadElections();
  }, [user]);

  // Derived filtered elections list
  const filteredElections = useMemo(() => {
    return elections.filter((election) => {
      const matchesSearch = election.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const hasVoted = votedMap[election.id];

      if (!matchesSearch) return false;

      if (activeTab === "active") return election.active && !hasVoted;
      if (activeTab === "voted") return hasVoted;
      if (activeTab === "ended") return !election.active;
      return true; // "all"
    });
  }, [elections, searchQuery, activeTab, votedMap]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>Official Ballots</span>
            <h1>Cast Your Vote Securely</h1>
            <p>
              Browse active elections, review candidate profiles, and submit your encrypted digital ballot.
            </p>
          </div>
        </div>

        {/* Toolbar: Search and Filter Tabs */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search elections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "all" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All ({elections.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === "active" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Active
            </button>
            <button
              className={`${styles.tab} ${activeTab === "voted" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("voted")}
            >
              Voted
            </button>
            <button
              className={`${styles.tab} ${activeTab === "ended" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("ended")}
            >
              Ended
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className={styles.skeletonGrid}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.skeletonCard} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorCard}>
            <p>{error}</p>
          </div>
        ) : filteredElections.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🗳️</div>
            <h3>No elections found</h3>
            <p>
              {searchQuery
                ? "No elections match your search criteria."
                : "There are currently no active elections available to vote in."}
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredElections.map((election) => {
              const hasVoted = votedMap[election.id];

              return (
                <div
                  key={election.id}
                  className={`${styles.card} ${hasVoted ? styles.cardVoted : ""}`}
                  onClick={() => navigate(`/vote/${election.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/vote/${election.id}`);
                    }
                  }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.iconBox}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>

                    {hasVoted ? (
                      <span className={styles.badgeVoted}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Voted
                      </span>
                    ) : election.active ? (
                      <span className={styles.badgeActive}>Active</span>
                    ) : (
                      <span className={styles.badgeEnded}>Ended</span>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    <h2>{election.title}</h2>
                    <p>
                      {election.description ||
                        "Tap to review candidate profiles and submit your secure digital ballot."}
                    </p>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.actionText}>
                      {hasVoted ? "Review Submitted Ballot" : "Cast Vote"}
                    </span>
                    <span className={styles.arrowIcon}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;