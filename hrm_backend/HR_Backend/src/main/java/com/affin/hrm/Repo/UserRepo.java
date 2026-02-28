package com.affin.hrm.Repo;

import com.affin.hrm.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Integer> {

    @Query(value = "SELECT * FROM users WHERE id = ?1", nativeQuery = true)
    User getUserById(Integer userId);

    @Query(value = "SELECT * FROM users WHERE email = ?1", nativeQuery = true)
    Optional<User> findByEmail(String email);

    @Query(value = "SELECT * FROM users WHERE LOWER(email) = LOWER(?1) LIMIT 1", nativeQuery = true)
    Optional<User> findByEmailIgnoreCase(String email);
}
