package com.cloudnative.voting.model;

import jakarta.persistence.*;

@Entity
@Table(name = "candidate")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private int voteCount;

    public Candidate() {
    }

    public Candidate(Long id, String name, int voteCount) {
        this.id = id;
        this.name = name;
        this.voteCount = voteCount;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getVoteCount() {
        return voteCount;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setVoteCount(int voteCount) {
        this.voteCount = voteCount;
    }
}
