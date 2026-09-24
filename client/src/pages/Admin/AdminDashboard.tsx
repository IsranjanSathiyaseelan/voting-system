import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { organizationService } from "../../services/organizationService";
import { voteService, type DailyVoteCount } from "../../services/voteService";
import { candidateService } from "../../services/candidateService";
import { electionService } from "../../services/electionService";
import { userService } from "../../services/userService";
import type { Candidate } from "../../types/candidate";
import type { Election } from "../../types/election";

import type { Organization } from "../../types/organization";
import type { User } from "../../types/auth";

import DashboardHero from "./DashboardHero";
import DashboardStats from "./DashboardStats";
import DailyVotingChart from "./DailyVotingChart";
import MembersTable from "./MembersTable";
import ElectionsTable from "./ElectionsTable";
import styles from "./AdminDashboard.module.css";

// Valid view keys driven by the sidebar's ?view= search param
type DashboardView = "dashboard" | "members" | "elections" | "analytics" | "polls" | "reports";

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeView = (searchParams.get("view") ?? "dashboard") as DashboardView;

  // ── Shared data state ──────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [dailyVotes, setDailyVotes] = useState<DailyVoteCount[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // ── Loading state ──────────────────────────────────────────────────────────
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const [dashboardStats, candidateData, electionData] = await Promise.all([
          organizationService.getDashboardStats().catch((): DashboardStats | null => null),
          candidateService.getResults().catch((): Candidate[] => []),
          electionService.getAll().catch((): Election[] => []),
        ]);
        setStats(dashboardStats);
        setCandidates(candidateData);
        setElections(electionData);
      } catch {
        // fall back gracefully
      } finally {
        setStatsLoading(false);
      }
    };

    const loadChart = async () => {
      setChartLoading(true);
      try {
        const data = await voteService.getDailyVotes().catch((): DailyVoteCount[] => []);
        setDailyVotes(data);
      } catch {
        setDailyVotes([]);
      } finally {
        setChartLoading(false);
      }
    };

    const loadMembersData = async () => {
      setMembersLoading(true);
      try {
        const [memberList, orgList] = await Promise.all([
          userService.getMembers().catch((): User[] => []),
          organizationService.getAll().catch((): Organization[] => []),
        ]);
        setMembers(memberList);
        setOrganizations(orgList);
      } catch {
        setMembers([]);
        setOrganizations([]);
      } finally {
        setMembersLoading(false);
      }
    };

    void loadStats();
    void loadChart();
    void loadMembersData();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUpdateStatus = async (memberId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "RESTRICTED" : "ACTIVE";
    setUpdatingMemberId(memberId);
    try {
      const updated = await userService.updateMemberStatus(memberId, nextStatus);
      setMembers((current) =>
        current.map((m) =>
          m.id === memberId ? { ...m, status: updated.status ?? nextStatus } : m,
        ),
      );
    } catch {
      setMembers((current) =>
        current.map((m) => (m.id === memberId ? { ...m, status: nextStatus } : m)),
      );
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // ── View renderer ──────────────────────────────────────────────────────────
  const renderView = () => {
    switch (activeView) {
      case "members":
        return (
          <MembersTable
            members={members}
            organizations={organizations}
            loading={membersLoading}
            updatingMemberId={updatingMemberId}
            onUpdateStatus={(id, status) => void handleUpdateStatus(id, status)}
          />
        );

      case "elections":
        return <ElectionsTable elections={elections} />;

      case "analytics":
        return <DailyVotingChart dailyVotes={dailyVotes} loading={chartLoading} />;

      case "polls":
        // Polls view — renders elections table filtered to active only
        return <ElectionsTable elections={elections.filter((e) => e.active)} />;

      case "reports":
        // Reports view — same elections table with full data (could be extended)
        return <ElectionsTable elections={elections} />;

      case "dashboard":
      default:
        return (
          <>
            <DashboardHero />
            <DashboardStats
              stats={stats}
              candidates={candidates}
              elections={elections}
              loading={statsLoading}
            />
          </>
        );
    }
  };

  return <div className={styles.page}>{renderView()}</div>;
};

export default AdminDashboard;
