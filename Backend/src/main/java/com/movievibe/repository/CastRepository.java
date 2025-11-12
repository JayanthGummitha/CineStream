package com.movievibe.repository;

import com.movievibe.modal.Cast;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CastRepository extends JpaRepository<Cast,Long> {

    Cast findByName(String name);
}
