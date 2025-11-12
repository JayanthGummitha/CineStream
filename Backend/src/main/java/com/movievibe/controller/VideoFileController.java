package com.movievibe.controller;

import com.movievibe.modal.AudioFile;
import com.movievibe.modal.Movie;
import com.movievibe.modal.VideoFile;
import com.movievibe.repository.MovieRepository;
import com.movievibe.repository.VideoFileRepository;
import com.movievibe.service.MovieService;
import com.movievibe.service.VideoFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/movie/videoFile")
public class VideoFileController {

    @Autowired
    private VideoFileService videoFileService;

    @Autowired
    private VideoFileRepository videoFileRepository;
    @Autowired
    private MovieService movieService;

    @PostMapping("/add/{name}")
    public ResponseEntity<?> addCaptionForMovie(@PathVariable String name,@RequestBody VideoFile videoFile){
        Movie m=movieService.MovieByName(name);
        if (m!=null){
            VideoFile video=videoFileService.createVideoFileForMovie(m.getId(),videoFile);
            return new ResponseEntity<>(video,HttpStatus.OK);
        }
        return new ResponseEntity<>("Audio not added Successfully",HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/{movie}/{height}")
    public ResponseEntity<?> getVideoFileUsingHeightForMovie(@PathVariable(value = "movie")String movie,@PathVariable(value = "height")String height){
        Movie captionforMovie=movieService.MovieByName(movie);
        if(captionforMovie.getId()!=null){

            VideoFile videoFile=videoFileService.getVideoFileUsingHeightForMovie(captionforMovie.getId(),height);
             if(videoFile!=null){
                return new ResponseEntity<>(videoFile,HttpStatus.OK);
            }
        }
        return new ResponseEntity<>( "Using height format "+height+", video file not found for "+movie+" movie",HttpStatus.NOT_FOUND);
    }

    @GetMapping("/id/{movieId}")
    public ResponseEntity<?> getAllVideoFilesByMovieId(@PathVariable (value = "movieId") Long id){
        Movie m=movieService.getMovieById(id);

        if(m!=null){
            List<VideoFile> videoFiles=videoFileService.getAllVideoFilesForMovies(id);
            return new ResponseEntity<>(videoFiles, HttpStatus.OK);
        }
        return new ResponseEntity<>("video files not found for Movie id : "+id,HttpStatus.NOT_FOUND);
    }
    @GetMapping("/name/{name}")
    public ResponseEntity<?> getAllVideoFilesByMovieName(@PathVariable (value = "name") String name){
        Movie m=movieService.MovieByName(name);

        if(m!=null){
            List<VideoFile> videoFiles=videoFileService.getAllVideoFilesForMovies(m.getId());
            return new ResponseEntity<>(videoFiles, HttpStatus.OK);
        }
        return new ResponseEntity<>("video files not found for Movie name : "+name,HttpStatus.NOT_FOUND);
    }
    @PutMapping("/update/{movie}/{label}")
    public ResponseEntity<?> updateAudioFileUsingLabelForMovie(@PathVariable(value = "movie")String movie,@PathVariable(value = "label")String label,
                                                               @RequestBody VideoFile videoFile){
        Movie videoForMovie=movieService.MovieByName(movie);
        if(videoForMovie.getId()!=null){
            VideoFile findVideoFile=videoFileService.getVideoFileUsingHeightForMovie(videoForMovie.getId(),label);
            if(findVideoFile!=null){
                VideoFile updatedVideo=videoFileService.updateVideoFileForMovie(findVideoFile.getId(), videoFile);
                 return new ResponseEntity<>(updatedVideo,HttpStatus.OK);
            }
        }
        return new ResponseEntity<>( label+" video file  not found  for "+movie+" movie",HttpStatus.NOT_FOUND);
    }
    @DeleteMapping("/delete/{movie}/{height}")
    public ResponseEntity<?> deleteVideoFileUsingHeightForMovie(@PathVariable(value = "movie")String movie,@PathVariable(value = "height")String height){
        Movie captionforMovie=movieService.MovieByName(movie);
        if(captionforMovie.getId()!=null){

            VideoFile videoFile=videoFileService.getVideoFileUsingHeightForMovie(captionforMovie.getId(),height);

            if(videoFile!=null){
                Long videoId=videoFile.getId();
                videoFileService.deleteVideoFileForMovie(videoId);
                return new ResponseEntity<>("Video format "+height +" file is deleted for"+movie+" movie",HttpStatus.OK);
            }
        }
        return new ResponseEntity<>( "Video format "+height +" file is not found for"+movie+" movie to delete it ",HttpStatus.NOT_FOUND);
    }
}
