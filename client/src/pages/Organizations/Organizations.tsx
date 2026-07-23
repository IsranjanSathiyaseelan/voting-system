import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { organizationService } from "../../services/organizationService";
import type { Organization } from "../../types/organization";
import styles from "./Organizations.module.css";

const Organizations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await organizationService.getAll().catch(() => [] as Organization[]);
        setOrganizations(data);

        if (user && user.id && data.length > 0) {
          const voteStatuses = await Promise.all(
            data.map(async (organization) => {
              const status = await organizationService
                .getVoteStatus(user.id, organization.id)
                .catch(() => ({ hasVoted: false }));

              return [organization.id, status.hasVoted] as const;
            }),
          );

          setVotedMap(Object.fromEntries(voteStatuses));
        } else {
          setVotedMap({});
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load organizations.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadOrganizations();
  }, [user]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <span className={styles.badge}>Organizations</span>
          <h1>Choose where you want to vote</h1>
          <p>
            Browse organizations, open a ballot, and cast your vote in each organization you belong to.
          </p>
        </div>

        {loading ? (
          <p className={styles.state}>Loading organizations…</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : organizations.length === 0 ? (
          <div className={styles.emptyState}>
            No active organizations are available to view at this time.
          </div>
        ) : (
          <div className={styles.grid}>
            {organizations.map((organization) => {
              const hasVoted = votedMap[organization.id];

              return (
                <button
                  key={organization.id}
                  type="button"
                  className={styles.card}
                  onClick={() => navigate(`/vote/${organization.id}`)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.logo}>
                      {organization.icon?.trim() || organization.name.charAt(0)}
                    </div>
                    {hasVoted ? (
                      <span className={styles.votedBadge}>Voted</span>
                    ) : (
                      <span className={styles.openBadge}>Open</span>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    <h2>{organization.name}</h2>
                    <p>
                      {organization.description ??
                        "Tap to review candidates and cast your ballot."}
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

export default Organizations;
