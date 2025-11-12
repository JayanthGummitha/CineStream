package com.movievibe.repository;

import com.movievibe.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {

    User findByFirstName(String name);
    User findByEmail(String email);


}
