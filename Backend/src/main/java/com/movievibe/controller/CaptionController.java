package com.movievibe.controller;
import com.movievibe.modal.Caption;
import com.movievibe.modal.Movie;
import com.movievibe.service.CaptionService;
import com.movievibe.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/movie/caption")
public class CaptionController {

    @Autowired
    private CaptionService captionService;
    @Autowired
    private MovieService movieService;

    @PostMapping("/add/{name}")
    public ResponseEntity<?> addCaptionForMovie(@PathVariable String name,@RequestBody Caption caption){
        Movie m=movieService.MovieByName(name);
        if (m!=null){
            Caption cap=captionService.createCaption(m.getId(),caption);
            return new ResponseEntity<>(cap,HttpStatus.OK);
        }
        return new ResponseEntity<>("Caption not added Successfully",HttpStatus.OK);
    }
    @GetMapping("/{movie}/{label}")
    public ResponseEntity<?> getCaptionUsingLabelForMovie(@PathVariable(value = "movie")String movie,@PathVariable(value = "label")String label){
        Movie captionforMovie=movieService.MovieByName(movie);
        if(captionforMovie.getId()!=null){
            Caption caption=captionService.getCaptionByUsingLabelForMovie(captionforMovie.getId(),label);
            if(caption!=null){
                return new ResponseEntity<>(caption,HttpStatus.OK);
            }
        }
        return new ResponseEntity<>( label+" Caption  not found  for "+movie+" movie",HttpStatus.NOT_FOUND);
    }

    @GetMapping("/id/{movieId}")
    public ResponseEntity<?> getAllCaptionForMovie(@PathVariable(value = "movieId") Long id){
        Movie m=movieService.getMovieById(id);
        if(m.getId()!=null){
            List<Caption> cap=captionService.getAllCaptionsById(id);
            if(cap!=null) {
                return new ResponseEntity<>(cap, HttpStatus.OK);
            }
        }
        return new ResponseEntity<>("caption files not found for Movie id : "+id,HttpStatus.NOT_FOUND);
    }
    @GetMapping("/name/{name}")
    public ResponseEntity<?> getAllCaptionsByMovieName(@PathVariable String name){
        Movie mv=movieService.MovieByName(name);
        if(mv.getId()!=null){
            List<Caption> cp=captionService.getAllCaptionsById(mv.getId());
            if(cp!=null) {
                return new ResponseEntity<>(cp, HttpStatus.OK);
            }
        }
        return new ResponseEntity<>("caption file not found for"+name+" movie: ", HttpStatus.NOT_FOUND);
    }
    @PutMapping("/update/{movie}/{label}")
    public ResponseEntity<?> updateCaptionUsingLabelForMovie(@PathVariable(value = "movie")String movie,@PathVariable(value = "label")String label,
                                                             @RequestBody Caption caption){
        Movie captionforMovie=movieService.MovieByName(movie);
        if(captionforMovie.getId()!=null){
            Caption findCaption=captionService.getCaptionByUsingLabelForMovie(captionforMovie.getId(),label);
            if(findCaption!=null){
                Caption updateCaption=captionService.updateCaptionById(findCaption.getId(),caption);
                return new ResponseEntity<>(updateCaption,HttpStatus.OK);
            }
        }
        return new ResponseEntity<>( label+" Caption  not found  for "+movie+" movie",HttpStatus.NOT_FOUND);
    }
    @DeleteMapping("/delete/{movie}/{label}")
    public ResponseEntity<?> deleteCaptionUsingLabelForMovie(@PathVariable(value = "movie")String movie,@PathVariable(value = "label")String label){
        Movie captionforMovie=movieService.MovieByName(movie);
        if(captionforMovie.getId()!=null){
            Caption caption=captionService.getCaptionByUsingLabelForMovie(captionforMovie.getId(),label);
            if(caption!=null){
                captionService.deleteCaptionById(caption.getId());
                return new ResponseEntity<>(label+" Caption file is deleted  for "+movie+" movie",HttpStatus.OK);
            }
        }
        return new ResponseEntity<>( label+" Caption  file not found  for "+movie+" movie",HttpStatus.NOT_FOUND);
    }



}
