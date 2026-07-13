package com.cloudnative.voting.controller;

import com.cloudnative.voting.dto.VoteRequest;
import com.cloudnative.voting.service.VoteService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class VoteControllerTest {

    @Test
    void castVoteReturnsCreatedForSuccessfulVote() {
        VoteService voteService = mock(VoteService.class);
        VoteController controller = new VoteController(voteService);
        VoteRequest request = new VoteRequest();

        when(voteService.castVote(any(VoteRequest.class))).thenReturn("Vote Cast Successfully");

        ResponseEntity<String> response = controller.castVote(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Vote Cast Successfully", response.getBody());
    }

    @Test
    void castVotePropagatesConflictWhenDuplicateVoteOccurs() {
        VoteService voteService = mock(VoteService.class);
        VoteController controller = new VoteController(voteService);
        VoteRequest request = new VoteRequest();

        when(voteService.castVote(any(VoteRequest.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "User already voted"));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.castVote(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals("User already voted", exception.getReason());
    }
}
