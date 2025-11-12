package com.movievibe.service;

import com.movievibe.modal.Cast;
import com.movievibe.modal.Movie;

import java.util.List;
import java.util.Set;

public interface CastService {

    Cast addNewCastMember(Long movieId, Cast cast);
    Cast getCastMemberById(Long id);
    Cast getCastMemberByName(String name);
    Cast updateCastMember(Long id,Cast cast);
    void deleteCastMemberByName(String name);
    void deleteCastMemberById(Long id);
    Set<Cast> getAllCastMembersByMovie(Long id);
}
