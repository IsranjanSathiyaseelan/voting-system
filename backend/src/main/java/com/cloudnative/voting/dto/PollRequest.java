package com.cloudnative.voting.dto;

import java.time.LocalDateTime;
import java.util.List;

/** Request body for creating or updating a Poll. */
public class PollRequest {

    private String question;

    /** List of option strings, serialized to JSON on save. */
    private List<String> options;

    private boolean active = true;

    private LocalDateTime endDate;

    public PollRequest() {}

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
}
