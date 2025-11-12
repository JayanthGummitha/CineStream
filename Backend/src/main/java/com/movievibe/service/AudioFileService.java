package com.movievibe.service;

import com.movievibe.modal.AudioFile;

import java.util.List;

public interface AudioFileService {

    AudioFile createAudioFileForMovie(Long id,AudioFile audioFile);
    AudioFile getAudioFileByUsingLabelForMovie(Long id,String name);
    AudioFile updateAudioFileForMovie(Long id,AudioFile audioFile);
    void  deleteAudioFileForMovie(Long id);
    List<AudioFile> getAllAudioFilesForMovieById(Long id);
    void deleteAllAudioFilesForMovieById(Long id);
}
