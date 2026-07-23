import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { electionService } from "../../services/electionService";
import { voteService } from "../../services/voteService";
import type { Election } from "../../types/election";
import styles from "./Elections.module.css";

const Elections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            }),
          );

          setVotedMap(Object.fromEntries(voteStatuses));
        } else {
          setVotedMap({});
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load elections.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadElections();
  }, [user]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <span className={styles.badge}>Active Elections</span>
          <h1>Cast Your Vote in Official Elections</h1>
          <p>
            Browse active elections, review candidate slates, and securely submit your digital ballot.
          </p>
        </div>

        {loading ? (
          <p className={styles.state}>Loading elections…</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : elections.length === 0 ? (
          <div className={styles.emptyState}>
            No active elections are available to vote in at this time.
          </div>
        ) : (
          <div className={styles.grid}>
            {elections.map((election) => {
              const hasVoted = votedMap[election.id];

              return (
                <button
                  key={election.id}
                  type="button"
                  className={styles.card}
                  onClick={() => navigate(`/vote/${election.id}`)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.logo}>
                      🗳
                    </div>
                    {hasVoted ? (
                      <span className={styles.votedBadge}>Voted</span>
                    ) : election.active ? (
                      <span className={styles.openBadge}>Active</span>
                    ) : (
                      <span className={styles.openBadge} style={{ opacity: 0.6 }}>Ended</span>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    <h2>{election.title}</h2>
                    <p>
                      {election.description ??
                        "Tap to review candidate profiles and submit your ballot."}
                    </p>
                  </div>

                  <div className={styles.cardFooter}>
                    <span>{hasVoted ? "Already voted" : "Vote now"}</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;
