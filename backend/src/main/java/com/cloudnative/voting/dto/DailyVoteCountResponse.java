package com.cloudnative.voting.dto;

public record DailyVoteCountResponse(String date, long votes) {
}
