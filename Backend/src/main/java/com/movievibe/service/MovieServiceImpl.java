package com.movievibe.service;

import com.movievibe.modal.AudioFile;
import com.movievibe.modal.Caption;
import com.movievibe.modal.Movie;
import com.movievibe.modal.VideoFile;
import com.movievibe.repository.AudioFileRepository;
import com.movievibe.repository.CaptionRepository;
import com.movievibe.repository.MovieRepository;
import com.movievibe.repository.VideoFileRepository;
import org.apache.coyote.http11.filters.VoidInputFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class MovieServiceImpl implements MovieService {

    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private CaptionRepository captionRepository;
    @Autowired
    private AudioFileRepository audioFileRepository;
    @Autowired
    private VideoFileRepository videoFileRepository;

    @Override
    public Movie createMovie(Movie movie) {
        Movie oldMovie=movieRepository.findByTitle(movie.getTitle());
        if(oldMovie==null){
            Movie newMovie=new Movie();
            newMovie.setTitle(movie.getTitle());
            newMovie.setYear(movie.getYear());
            newMovie.setDescription(movie.getDescription());
            newMovie.setLanguages(movie.getLanguages());
            newMovie.setGenres(movie.getGenres());
            newMovie.setFilmDirectors(movie.getFilmDirectors());
            newMovie.setMusicDirectors(movie.getMusicDirectors());
            newMovie.setCast(movie.getCast());
            newMovie.setImages(movie.getImages());
            newMovie.setTrailer(movie.getTrailer());
            newMovie.setThumbnail(movie.getThumbnail());
            Movie savedMovie=movieRepository.save(newMovie);
            Set<Caption> captionItems=new HashSet<>();

            for (Caption caption : movie.getCaption()) {
                Caption cap=new Caption();
                cap.setKind(caption.getKind());
                cap.setLabel(caption.getLabel());
                cap.setLanguage(caption.getLanguage());
                cap.setSrc(caption.getSrc());
                cap.setType(caption.getType());
                cap.setMovie(savedMovie);
               Caption savedCap= captionRepository.save(cap);// Save each caption entity
                captionItems.add(savedCap);
            }
            savedMovie.setCaption(captionItems);

            Set<AudioFile> audioItems =new HashSet<>();
            for(AudioFile audioFile:movie.getAudioFile()){
                AudioFile audio=new AudioFile();
                audio.setSrc(audioFile.getSrc());
                audio.setLabel(audioFile.getLabel());
                audio.setKind(audioFile.getKind());
                audio.setLanguage(audioFile.getLanguage());
                audio.setType(audioFile.getType());
                audio.setMovie(savedMovie);
                AudioFile savedAudio=audioFileRepository.save(audio);
                audioItems.add(savedAudio);
            }

            savedMovie.setAudioFile(audioItems);

            Set<VideoFile> videoItems=new HashSet<>();

            for(VideoFile videoFile:movie.getVideoFile()){
                VideoFile video=new VideoFile();
                video.setSrc(videoFile.getSrc());
                video.setType(videoFile.getType());
                video.setWidth(videoFile.getWidth());
                video.setHeight(videoFile.getHeight());
                video.setMovie(savedMovie);
                VideoFile savedVideo=videoFileRepository.save(video);
                videoItems.add(savedVideo);

            }

            savedMovie.setVideoFile(videoItems);


            Movie savedMovieExist=movieRepository.save(newMovie);


            return savedMovieExist;
        }


        throw new RuntimeException("movie is already available");
    }

    @Override
    public Movie getMovieById(Long id) {
        Optional<Movie> m=movieRepository.findById(id);
        if(m.isPresent()){
            return m.get();
        }

       throw new RuntimeException("movie id not found");
    }

    @Override
    public Movie updateMovieById(Long id, Movie movie) {
        Optional<Movie> oldMovie = movieRepository.findById(id);
        if (oldMovie.isPresent()) {
            Movie newMovie = oldMovie.get();

            // Update other fields of the movie
            newMovie.setTitle(movie.getTitle());
            newMovie.setYear(movie.getYear());
            newMovie.setDescription(movie.getDescription());
            newMovie.setLanguages(movie.getLanguages());
            newMovie.setGenres(movie.getGenres());
            newMovie.setFilmDirectors(movie.getFilmDirectors());
            newMovie.setMusicDirectors(movie.getMusicDirectors());
            newMovie.setCast(movie.getCast());
            newMovie.setImages(movie.getImages());
            newMovie.setTrailer(movie.getTrailer());
            newMovie.setThumbnail(movie.getThumbnail());

            // Update captions (similar to how it's done for audioFile)
            Set<Caption> captionItems = new HashSet<>();
            for (Caption caption : movie.getCaption()) {
                Caption cap = new Caption();
                cap.setKind(caption.getKind());
                cap.setLabel(caption.getLabel());
                cap.setLanguage(caption.getLanguage());
                cap.setSrc(caption.getSrc());
                cap.setType(caption.getType());
                cap.setMovie(newMovie);
                captionItems.add(cap);
            }
            newMovie.setCaption(captionItems);

            // Handle audio files
            Set<AudioFile> audioItems = new HashSet<>();
            for (AudioFile audioFile : movie.getAudioFile()) {
                AudioFile audio = new AudioFile();
                audio.setSrc(audioFile.getSrc());
                audio.setLabel(audioFile.getLabel());
                audio.setKind(audioFile.getKind());
                audio.setLanguage(audioFile.getLanguage());
                audio.setType(audioFile.getType());
                audio.setMovie(newMovie);  // Ensure the movie is set for the audio file
                audioItems.add(audio);
            }

            // Set the updated audio files collection on the Movie object
            newMovie.setAudioFile(audioItems);

            // Handle video files (same pattern as audio)
            Set<VideoFile> videoItems = new HashSet<>();
            for (VideoFile videoFile : movie.getVideoFile()) {
                VideoFile video = new VideoFile();
                video.setSrc(videoFile.getSrc());
                video.setType(videoFile.getType());
                video.setWidth(videoFile.getWidth());
                video.setHeight(videoFile.getHeight());
                video.setMovie(newMovie);
                videoItems.add(video);
            }
            newMovie.setVideoFile(videoItems);

            // Save the updated movie and associated entities
            movieRepository.save(newMovie);

            return newMovie;
        }

        throw new RuntimeException("Movie not available to update");
    }

    @Override
    public void deleteMovieById(Long id) {
        Optional<Movie> movie=movieRepository.findById(id);
        if(movie.isPresent()){
            Movie mov=movie.get();
            movieRepository.findById(mov.getId());


        }
        throw new RuntimeException("Movie is not found");


    }

    @Override
    public Movie MovieByName(String name) {

        Movie movie=movieRepository.findByTitle(name);

        if(movie!=null){
            return movie;
        }
        throw  new RuntimeException("movie is not found");
    }

}
