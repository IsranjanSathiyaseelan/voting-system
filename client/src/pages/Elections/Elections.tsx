import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { electionService } from "../../services/electionService";
import { voteService } from "../../services/voteService";
import type { Election } from "../../types/election";
import { 
  HiOutlineSearch, 
  HiOutlineClipboardCheck, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineCollection,
  HiOutlineArrowRight
} from "react-icons/hi";
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

  // Stats calculation
  const stats = useMemo(() => {
    const total = elections.length;
    const active = elections.filter(e => e.active && !votedMap[e.id]).length;
    const voted = Object.values(votedMap).filter(Boolean).length;
    const ended = elections.filter(e => !e.active).length;
    return { total, active, voted, ended };
  }, [elections, votedMap]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* Redesigned Hero Header */}
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>Secure Portal</span>
            <h1>Explore Official Ballots</h1>
            <p>
              Participate in active community governance, review authenticated candidates, and cast your vote with confidence.
            </p>
          </div>
          
          {/* Quick Stats Grid */}
          <div className={styles.heroStats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total Ballots</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue} style={{ color: "#059669" }}>{stats.active}</span>
              <span className={styles.statLabel}>Active</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue} style={{ color: "#5651D8" }}>{stats.voted}</span>
              <span className={styles.statLabel}>Voted</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Search and Filter Tabs */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <HiOutlineSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search elections by name..."
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
              <HiOutlineCollection /> All ({stats.total})
            </button>
            <button
              className={`${styles.tab} ${activeTab === "active" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("active")}
            >
              <HiOutlineClock /> Active
            </button>
            <button
              className={`${styles.tab} ${activeTab === "voted" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("voted")}
            >
              <HiOutlineCheckCircle /> Voted
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
            <div className={styles.emptyIcon}>
              <HiOutlineClipboardCheck />
            </div>
            <h3>No elections found</h3>
            <p>
              {searchQuery
                ? "No elections match your current search parameters."
                : "There are currently no elections available in this category."}
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
                      <HiOutlineCollection />
                    </div>

                    {hasVoted ? (
                      <span className={styles.badgeVoted}>
                        <HiOutlineCheckCircle style={{ fontSize: "0.9rem" }} /> Voted
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
                        "Review authenticated candidate profiles and cast your secure encrypted ballot."}
                    </p>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.actionText}>
                      {hasVoted ? "View My Ballot" : "Cast Ballot Now"}
                    </span>
                    <span className={styles.arrowIcon}>
                      <HiOutlineArrowRight />
                    </span>
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