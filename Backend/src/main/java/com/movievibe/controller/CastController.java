package com.movievibe.controller;

import com.movievibe.modal.Cast;
import com.movievibe.modal.Movie;
import com.movievibe.repository.CastRepository;
import com.movievibe.service.CastService;
import com.movievibe.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/movie/cast")
public class CastController {

    @Autowired
    private CastService castService;

    @Autowired
    private CastRepository castRepository;

    @Autowired
    private MovieService movieService;

    @PostMapping("/add/{movie}")
    public ResponseEntity<?> addNewCastMember(@PathVariable String movie,@RequestBody Cast cast){
        Movie findMovie=movieService.MovieByName(movie);
        if(findMovie!=null){
            Cast newCast=castService.addNewCastMember(findMovie.getId(),cast);
            return new ResponseEntity<>(newCast,HttpStatus.OK);
        }
        return new ResponseEntity<>(cast.getName()+" details are not added to "+movie+"movie",HttpStatus.BAD_REQUEST);

    }

    @GetMapping("/{name}")
    public ResponseEntity<?> getCastByMovieName(@PathVariable String name){
        Movie movie=movieService.MovieByName(name);
        if(movie!=null){
            Set<Cast> cast=castService.getAllCastMembersByMovie(movie.getId());
            return new ResponseEntity<>(cast, HttpStatus.OK);
        }
        return new ResponseEntity<>("Cast members are not Found",HttpStatus.NOT_FOUND);

    }
    @GetMapping("/{movieName}/{castName}")
    public ResponseEntity<?> getCasMemberByMovieName(@PathVariable String movieName,@PathVariable String castName){
        Movie movie=movieService.MovieByName(movieName);
        if(movie!=null){
            Cast cast=castService.getCastMemberByName(castName);
            return new ResponseEntity<>(cast,HttpStatus.OK);
        }
        return new ResponseEntity<>(castName +" is not found in "+movieName,HttpStatus.NOT_FOUND);

    }
    @PutMapping("/update/{movieName}/{castName}")
    public ResponseEntity<?> updateCasMemberByMovieName(@PathVariable String movieName,@PathVariable String castName,
             @RequestBody Cast cast){
        Movie movie=movieService.MovieByName(movieName);
        if(movie!=null){
            Cast findCastName=castRepository.findByName(castName);
            Cast updatedCastMember=castService.updateCastMember(findCastName.getId(),cast);
            return new ResponseEntity<>(updatedCastMember,HttpStatus.OK);
        }
        return new ResponseEntity<>(castName +" is not found in "+movieName,HttpStatus.NOT_FOUND);

    }

}
