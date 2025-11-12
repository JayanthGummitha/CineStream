package com.movievibe.service;

import com.movievibe.modal.AudioFile;
import com.movievibe.modal.Movie;
import com.movievibe.repository.AudioFileRepository;
import com.movievibe.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AudioFileServiceImpl implements AudioFileService{

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private AudioFileRepository audioFileRepository;

    @Override
    public AudioFile createAudioFileForMovie(Long id,AudioFile audioFile) {
        Optional<Movie> movieId=movieRepository.findById(id);

        if(movieId.isPresent()){
            Movie movie=movieId.get();
            AudioFile  newAudio=new AudioFile();
            newAudio.setMovie(movie);
            newAudio.setSrc(audioFile.getSrc());
            newAudio.setLabel(audioFile.getLabel());
            newAudio.setKind(audioFile.getKind());
            newAudio.setType(audioFile.getType());
            newAudio.setLanguage(audioFile.getLanguage());
            audioFileRepository.save(newAudio);
             return newAudio;

        }
        throw new RuntimeException("movie not found to add audio File");
    }

    @Override
    public AudioFile getAudioFileByUsingLabelForMovie(Long id,String name) {
        Optional<Movie> movie=movieRepository.findById(id);

        if(movie.isPresent()){
            Movie audio=movie.get();
            AudioFile audioFile=audioFileRepository.findAudioFileUsingLabelForMovie(audio.getId(),name);
            return audioFile;

        }
        throw new RuntimeException("audioFile are not found for movie");
    }

    @Override
    public AudioFile updateAudioFileForMovie(Long id, AudioFile audioFile) {
        Optional<AudioFile> findAudioID=audioFileRepository.findById(id);

        if(findAudioID.isPresent()){
            AudioFile updateAudio=findAudioID.get();
            updateAudio.setMovie(findAudioID.get().getMovie());
            updateAudio.setLanguage(audioFile.getLanguage());
            updateAudio.setType(audioFile.getType());
            updateAudio.setSrc(audioFile.getSrc());
            updateAudio.setKind(audioFile.getKind());
            updateAudio.setLabel(audioFile.getLabel());
            return  audioFileRepository.save(updateAudio);
        }
        throw new RuntimeException("Audio file not found");
    }

    @Override
    public void deleteAudioFileForMovie(Long id) {
        Optional<AudioFile> audioFile=audioFileRepository.findById(id);

        if(audioFile.isPresent()){
            AudioFile audio=audioFile.get();
            movieRepository.deleteById(audio.getId());

        }
        throw new RuntimeException("Audio file is not found");

    }

    @Override
    public List<AudioFile> getAllAudioFilesForMovieById(Long id) {
        Optional<Movie> movie=movieRepository.findById(id);

        if(movie.isPresent()){
            List<AudioFile> audioFiles=audioFileRepository.findAllAudioFilesByMovieId(id);
            return audioFiles;

        }
        throw new RuntimeException("audioFiles are not found");
    }

    @Override
    public void deleteAllAudioFilesForMovieById(Long id) {

    }
}
