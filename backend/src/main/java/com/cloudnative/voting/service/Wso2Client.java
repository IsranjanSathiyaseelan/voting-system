package com.cloudnative.voting.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class Wso2Client {

    private final WebClient webClient;
    private final String wso2Token;

    public Wso2Client(
            WebClient.Builder webClientBuilder,
            @Value("${wso2.base-url}") String baseUrl,
            @Value("${wso2.token}") String wso2Token) {

        this.webClient = webClientBuilder
                .baseUrl(baseUrl)
                .build();

        this.wso2Token = wso2Token;
    }

    public String get(String path) {
        return webClient
                .get()
                .uri(path)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + wso2Token
                )
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public String post(String path, Object body) {
        return webClient
                .post()
                .uri(path)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + wso2Token
                )
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
