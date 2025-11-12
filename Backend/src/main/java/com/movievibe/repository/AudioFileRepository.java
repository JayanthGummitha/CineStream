package com.movievibe.repository;

import com.movievibe.modal.AudioFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AudioFileRepository extends JpaRepository<AudioFile,Long> {

    @Query("SELECT a FROM AudioFile a WHERE a.movie.id= :movieId")
    List<AudioFile> findAllAudioFilesByMovieId(@Param(value = "movieId")Long id);
    @Query("SELECT a FROM AudioFile a WHERE a.label= :label and a.movie.id= :movieId")
    AudioFile findAudioFileUsingLabelForMovie(@Param(value = "movieId")Long id,@Param(value = "label")String label);
}
