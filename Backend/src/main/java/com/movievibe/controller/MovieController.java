package com.movievibe.controller;

import com.movievibe.modal.Movie;
import com.movievibe.modal.User;
import com.movievibe.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/movie")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @PostMapping("/add")
    public ResponseEntity<?> createMovie(@RequestBody Movie movie){

        if(movie!=null){
            Movie newMovie=movieService.createMovie(movie);
            return new ResponseEntity<>(newMovie,HttpStatus.CREATED);

        }
        return new ResponseEntity<>("Movie is not saved",HttpStatus.BAD_REQUEST);

    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Long id){
        Movie movie=movieService.getMovieById(id);
        if(movie!=null){
            return new ResponseEntity<>(movie,HttpStatus.OK);
        }
        return new ResponseEntity<>("User not found ",HttpStatus.NOT_FOUND);

    }
    @GetMapping("/get/{name}")
    public ResponseEntity<?> movieByName(@PathVariable String name){
        Movie movie=movieService.MovieByName(name);
        if(movie!=null){
            return new ResponseEntity<>(movie,HttpStatus.OK);
        }
        return new ResponseEntity<>("Movie is not available",HttpStatus.BAD_REQUEST);

    }
    @PutMapping("/update/{name}")
    private ResponseEntity<?> updateMovieByName(@PathVariable String name,@RequestBody Movie movie){
        Movie mv=movieService.MovieByName(name);
        System.out.println(mv.getId());
        if(mv!=null){
            Movie findMovieId=movieService.updateMovieById(mv.getId(),movie);
            return new ResponseEntity<>(findMovieId,HttpStatus.OK);
        }
        return new ResponseEntity<>("movie is not updated",HttpStatus.BAD_REQUEST);
    }
    @DeleteMapping("/delete/{name}")
    public ResponseEntity<?> deleteMovieByName(@PathVariable String name){
        Movie movie=movieService.MovieByName(name);
        if(movie!=null){
            movieService.deleteMovieById(movie.getId());
            return new ResponseEntity<>(name+" movie is deleted permanently",HttpStatus.OK);
        }
        return new ResponseEntity<>("Movie is not available",HttpStatus.BAD_REQUEST);

    }







}
