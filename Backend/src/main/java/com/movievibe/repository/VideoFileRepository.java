package com.movievibe.repository;

import com.movievibe.modal.VideoFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VideoFileRepository extends JpaRepository<VideoFile,Long> {

    @Query("SELECT v FROM VideoFile v where v.movie.id= :movieId")
    List<VideoFile> findAllVideoFilesByMovieId(@Param(value = "movieId")Long id);

    @Query("SELECT v FROM VideoFile v where v.height= :height and v.movie.id= :movieId")
    VideoFile findVideoFileUsingHeightForMovie(@Param(value = "movieId")Long id,@Param(value = "height")String height);
}
