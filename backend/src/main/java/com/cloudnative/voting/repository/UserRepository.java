package com.cloudnative.voting.repository;

import com.cloudnative.voting.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
/**
 * Repository interface for User entity.
 * Spring Data JPA automatically provides CRUD operations
 * such as save, findById, findAll, deleteById, etc.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Finds a user by their username.
     *
     * Spring Data JPA automatically generates the query:
     * SELECT * FROM users WHERE username = ?
     *
     * @param username the username to search for
     * @return an Optional containing the User if found,
     *         otherwise an empty Optional
     */
    Optional<User> findByUsername(String username);

}
