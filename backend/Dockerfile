# ── Stage 1: Build ────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Cache dependencies by copying pom.xml first
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src

RUN ./mvnw package -DskipTests -B

# ── Stage 2: Runtime ──────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S votesecure && adduser -S votesecure -G votesecure

COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

RUN chown votesecure:votesecure app.jar

USER votesecure

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]