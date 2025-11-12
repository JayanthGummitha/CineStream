package com.movievibe.service;

import com.movievibe.modal.AudioFile;
import com.movievibe.modal.VideoFile;

import java.util.List;

public interface VideoFileService {

    VideoFile createVideoFileForMovie(Long id,VideoFile videoFile);
    VideoFile getVideoFileUsingHeightForMovie(Long id,String label);
    VideoFile updateVideoFileForMovie(Long id,VideoFile videoFile);
    void  deleteVideoFileForMovie(Long id);
    List<VideoFile> getAllVideoFilesForMovies(Long id);
    void deleteAllVideoFilesForMovieById(Long id);
}
