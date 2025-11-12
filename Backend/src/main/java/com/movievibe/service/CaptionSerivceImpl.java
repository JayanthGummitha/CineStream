package com.movievibe.service;

import com.movievibe.modal.Caption;
import com.movievibe.modal.Movie;
import com.movievibe.repository.CaptionRepository;
import com.movievibe.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CaptionSerivceImpl implements CaptionService{

    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private CaptionRepository captionRepository;
    @Override
    public Caption createCaption(Long id,Caption caption) {
        Optional<Movie> movie=movieRepository.findById(id);
        Movie mv=movie.get();
        if(movie.isPresent()) {
           Caption cp=new Caption();
           cp.setSrc(caption.getSrc());
           cp.setLabel(caption.getLabel());
           cp.setKind(caption.getKind());
           cp.setLanguage(caption.getLanguage());
           cp.setType(caption.getType());
           cp.setMovie(mv);
           captionRepository.save(cp);
           return cp;

        }

        throw new RuntimeException("Caption not  added ..");
    }

    @Override
    public Caption getCaptionByUsingLabelForMovie(Long id,String label) {
        Optional<Movie> findMovie=movieRepository.findById(id);


        if(findMovie.isPresent()){
            Movie movie=findMovie.get();
            Caption caption=captionRepository.findCaptionForMovieUsingLabel(movie.getId(),label);
            return  caption;
        }

        throw new RuntimeException("Caption not for movie using label");
    }

    @Override
    public Caption updateCaptionById(Long captionId, Caption caption) {

        Optional<Caption> updateCaption=captionRepository.findById(captionId);
        if(updateCaption.isPresent()){
            Caption cap=updateCaption.get();
                cap.setKind(caption.getKind());
                cap.setLabel(caption.getLabel());
                cap.setLanguage(caption.getLanguage());
                cap.setSrc(caption.getSrc());
                cap.setType(caption.getType());
                cap.setMovie(updateCaption.get().getMovie());
                return captionRepository.save(cap);

        }
        throw new RuntimeException("Caption is not updated");
    }

    @Override
    public void deleteCaptionById(Long id) {
        Optional<Movie> movie=movieRepository.findById(id);
        if(movie.isPresent()){
            captionRepository.deleteById(id);
        }
        throw new RuntimeException("Caption is deleted for movie");
    }

    @Override
    public List<Caption> getAllCaptionsById(Long id) {
        Optional<Movie> m=movieRepository.findById(id);
        if(m.isPresent()){

            List<Caption> c=captionRepository.findAllCaptionsByMovieId(id);
            return c;

        }
        throw new RuntimeException("captions are not found");

    }

    @Override
    public void deleteAllCaptionsById(Long id) {

    }
}
