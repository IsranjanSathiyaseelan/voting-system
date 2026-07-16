package com.cloudnative.voting.dto;

/** Dashboard statistics for an organization. */
public class DashboardStatsResponse {

    private long totalMembers;
    private long totalElections;
    private long activeElections;
    private long totalVotes;
    private long totalPolls;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalMembers, long totalElections, long activeElections,
                                   long totalVotes, long totalPolls) {
        this.totalMembers = totalMembers;
        this.totalElections = totalElections;
        this.activeElections = activeElections;
        this.totalVotes = totalVotes;
        this.totalPolls = totalPolls;
    }

    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }

    public long getTotalElections() { return totalElections; }
    public void setTotalElections(long totalElections) { this.totalElections = totalElections; }

    public long getActiveElections() { return activeElections; }
    public void setActiveElections(long activeElections) { this.activeElections = activeElections; }

    public long getTotalVotes() { return totalVotes; }
    public void setTotalVotes(long totalVotes) { this.totalVotes = totalVotes; }

    public long getTotalPolls() { return totalPolls; }
    public void setTotalPolls(long totalPolls) { this.totalPolls = totalPolls; }
}
