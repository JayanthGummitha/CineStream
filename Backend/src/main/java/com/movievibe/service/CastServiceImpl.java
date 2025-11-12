package com.movievibe.service;

import com.movievibe.modal.Cast;
import com.movievibe.modal.Movie;
import com.movievibe.repository.CastRepository;
import com.movievibe.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class CastServiceImpl implements CastService{

    @Autowired
    private CastRepository castRepository;
    @Autowired
    private MovieServiceImpl movieServiceImpl;
    @Autowired
    private MovieRepository movieRepository;

    @Override
    public Cast addNewCastMember(Long movieId,Cast cast) {
        Movie movie=movieServiceImpl.getMovieById(movieId);
        Cast findCast=castRepository.findByName(cast.getName());


        if(movie!=null&&findCast==null){
            Cast newCast=new Cast();
            newCast.setName(cast.getName());
            newCast.setImage(cast.getImage());
           Cast savedCast= castRepository.save(newCast);
            movie.getCast().add(newCast);
            movieRepository.save(movie);
            return savedCast;

        }
        throw new RuntimeException("Cast member not added");
    }

    @Override
    public Cast getCastMemberById(Long id) {
        Optional<Cast> findCast=castRepository.findById(id);
        if(findCast.isPresent()){

            castRepository.findById(id);
        }
        throw new RuntimeException("Cast member id not found to delete");
    }

    @Override
    public Cast getCastMemberByName(String name) {

        return castRepository.findByName(name);
    }

    @Override
    public Cast updateCastMember(Long id, Cast cast) {

        Optional<Cast> findCast=castRepository.findById(id);
        if(findCast.isPresent()){
            Cast newCast=findCast.get();
            newCast.setName(cast.getName());
            newCast.setImage(cast.getImage());
            return  castRepository.save(newCast);
        }
        throw  new RuntimeException("cast member is not found to update");
    }

    @Override
    public void deleteCastMemberByName(String name) {
        Cast findCast=castRepository.findByName(name);
        if(findCast.getName()!=null){
            castRepository.deleteById(findCast.getId());
        }
        throw new RuntimeException("Cast member name not found to delete");

    }

    @Override
    public void deleteCastMemberById(Long id) {
        Optional<Cast> findCast=castRepository.findById(id);
        if(findCast.isPresent()){
            Cast deleteCast=findCast.get();
            castRepository.deleteById(deleteCast.getId());
        }
        throw new RuntimeException("Cast member id not found to delete");

    }

    @Override
    public Set<Cast> getAllCastMembersByMovie(Long id) {
        Movie movie=movieServiceImpl.getMovieById(id);
        if(movie!=null){

            Set<Cast> list=movie.getCast();
            return list;
        }
        throw new RuntimeException("Cast Members are not found");
    }
}
