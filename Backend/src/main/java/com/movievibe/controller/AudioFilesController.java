package com.movievibe.controller;

import com.movievibe.modal.AudioFile;
import com.movievibe.modal.Caption;
import com.movievibe.modal.Movie;
import com.movievibe.modal.VideoFile;
import com.movievibe.repository.AudioFileRepository;
import com.movievibe.repository.MovieRepository;
import com.movievibe.repository.VideoFileRepository;
import com.movievibe.service.AudioFileService;
import com.movievibe.service.CaptionService;
import com.movievibe.service.MovieService;
import com.movievibe.service.VideoFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/movie/audioFile")
public class AudioFilesController {

    @Autowired
    private VideoFileService videoFileService;

    @Autowired
    private AudioFileService audioFileService;
    @Autowired
    private MovieService movieService;
    @Autowired
    private AudioFileService AudioFileService;

    @PostMapping("/add/{name}")
    public ResponseEntity<?> addCaptionForMovie(@PathVariable String name,@RequestBody AudioFile audioFile){
        Movie m=movieService.MovieByName(name);
        if (m!=null){
            AudioFile audio=audioFileService.createAudioFileForMovie(m.getId(),audioFile);
            return new ResponseEntity<>(audio,HttpStatus.OK);
        }
        return new ResponseEntity<>("Audio not added Successfully",HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/{movie}/{label}")
    public ResponseEntity<?> getAudioFileUsingLabelForMovie(@PathVariable(value = "movie")String movie,@PathVariable(value = "label")String label){
        Movie captionforMovie=movieService.MovieByName(movie);
        if(captionforMovie.getId()!=null){

           AudioFile audioFile= audioFileService.getAudioFileByUsingLabelForMovie(captionforMovie.getId(),label);
            if(audioFile!=null){
                return new ResponseEntity<>(audioFile,HttpStatus.OK);
            }
        }
        return new ResponseEntity<>( label+" audio file  not found  for "+movie+" movie",HttpStatus.NOT_FOUND);
    }
    @GetMapping("/id/{movieId}")
    public ResponseEntity<?> getAllAudioFilesByMovieId(@PathVariable(value = "movieId") Long id){
        Movie m=movieService.getMovieById(id);

        if(m!=null){
            List<AudioFile> audioFiles=audioFileService.getAllAudioFilesForMovieById(id);
            return new ResponseEntity<>(audioFiles, HttpStatus.OK);
        }
        return new ResponseEntity<>("audio files not found for Movie id : "+id,HttpStatus.NOT_FOUND);
    }
    @GetMapping("/name/{name}")
    public ResponseEntity<?> getAllAudioFilesByMovieName(@PathVariable (value = "name") String name){
        Movie m=movieService.MovieByName(name);

        if(m!=null){
            List<AudioFile> audioFiles=audioFileService.getAllAudioFilesForMovieById(m.getId());
            return new ResponseEntity<>(audioFiles, HttpStatus.OK);
        }
        return new ResponseEntity<>("audio files not found for Movie name : "+name,HttpStatus.NOT_FOUND);
    }

    @PutMapping("/update/{movie}/{label}")
    public ResponseEntity<?> updateAudioFileUsingLabelForMovie(@PathVariable(value = "movie")String movie,@PathVariable(value = "label")String label,
                                                             @RequestBody AudioFile audioFile){
        Movie audioforMovie=movieService.MovieByName(movie);
        if(audioforMovie.getId()!=null){
            AudioFile findAudio=audioFileService.getAudioFileByUsingLabelForMovie(audioforMovie.getId(),label);
            if(findAudio!=null){
                AudioFile updatedAudio=audioFileService.updateAudioFileForMovie(findAudio.getId(), audioFile);
                return new ResponseEntity<>(updatedAudio,HttpStatus.OK);
            }
        }
        return new ResponseEntity<>( label+" Caption  not found  for "+movie+" movie",HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/delete/{movie}/{label}")
    public ResponseEntity<?> deleteAudioFileUsingLabelForMovie(@PathVariable(value = "movie")String movie,@PathVariable(value = "label")String label){
        Movie captionforMovie=movieService.MovieByName(movie);
        if(captionforMovie.getId()!=null){
            AudioFile audioFile= audioFileService.getAudioFileByUsingLabelForMovie(captionforMovie.getId(),label);
            if(audioFile!=null){
                audioFileService.deleteAudioFileForMovie(audioFile.getId());
                return new ResponseEntity<>(label+" audio file  is deleted for "+movie+" movie",HttpStatus.OK);
            }
        }
        return new ResponseEntity<>( label+" audio file  not found  for "+movie+" movie",HttpStatus.NOT_FOUND);
    }

}
