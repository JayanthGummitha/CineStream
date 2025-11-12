package com.movievibe.repository;

import com.movievibe.modal.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie,Long> {

    Movie findByTitle(String name);
}
