package com.movievibe.service;

import com.movievibe.modal.Movie;

public interface MovieService {

    Movie createMovie(Movie movie);
    Movie getMovieById(Long id);
    Movie updateMovieById(Long id,Movie movie);
    void deleteMovieById(Long id);

    Movie MovieByName(String name);
}
