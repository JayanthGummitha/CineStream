package com.movievibe.repository;

import com.movievibe.modal.Caption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CaptionRepository extends JpaRepository<Caption,Long> {

    @Query("SELECT c FROM Caption c WHERE c.movie.id= :movieId")
    List<Caption> findAllCaptionsByMovieId(@Param(value = "movieId") Long id);

    @Query("SELECT c FROM Caption c WHERE c.label= :label and c.movie.id= :movieId")
    Caption findCaptionForMovieUsingLabel(@Param(value = "movieId")Long id, @Param(value = "label")String label);


}
