package com.movievibe.service;

import com.movievibe.modal.Movie;
import com.movievibe.modal.VideoFile;
import com.movievibe.repository.MovieRepository;
import com.movievibe.repository.VideoFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VideoFileServiceImpl implements VideoFileService {

    @Autowired
    private VideoFileRepository videoFileRepository;
    @Autowired
    private MovieRepository movieRepository;
    @Override
    public VideoFile createVideoFileForMovie(Long id,VideoFile videoFile) {

        Optional<Movie> movie=movieRepository.findById(id);
        if(movie.isPresent()){
            Movie movieId=movie.get();
            VideoFile newVideo=new VideoFile();
            newVideo.setMovie(movieId);
            newVideo.setSrc(videoFile.getSrc());
            newVideo.setType(videoFile.getType());
            newVideo.setWidth(videoFile.getWidth());
            newVideo.setHeight(videoFile.getHeight());
            return  videoFileRepository.save(newVideo);
        }
        throw new RuntimeException( "movie not found to add video file");

    }

    @Override
    public VideoFile getVideoFileUsingHeightForMovie(Long id,String label) {
        Optional<Movie> movie=movieRepository.findById(id);

        if(movie.isPresent()){
            Movie video=movie.get();
            VideoFile videoFile=videoFileRepository.findVideoFileUsingHeightForMovie(video.getId(),label);
            return videoFile;

        }
        throw new RuntimeException("audioFile are not found for movie");
    }

    @Override
    public VideoFile updateVideoFileForMovie(Long id, VideoFile videoFile) {

        Optional<VideoFile>findVideoID=videoFileRepository.findById(id);
        if(findVideoID.isPresent()){
            VideoFile updateVideo=findVideoID.get();
            updateVideo.setMovie(findVideoID.get().getMovie());
            updateVideo.setSrc(videoFile.getSrc());
            updateVideo.setType(videoFile.getType());
            updateVideo.setWidth(videoFile.getWidth());
            updateVideo.setHeight(videoFile.getHeight());
            return  videoFileRepository.save(updateVideo);
        }
        throw new RuntimeException( "video file not found to update");
    }

    @Override
    public void deleteVideoFileForMovie(Long id) {
        Optional<VideoFile> videoFile=videoFileRepository.findById(id);
        if(videoFile.isPresent()){
            VideoFile videoId=videoFile.get();
            videoFileRepository.deleteById(videoId.getId());
        }

    }

    @Override
    public List<VideoFile> getAllVideoFilesForMovies(Long id) {
        Optional<Movie> mov=movieRepository.findById(id);
        if(mov.isPresent()){

            List<VideoFile> video=videoFileRepository.findAllVideoFilesByMovieId(id);
            return video;

        }
        throw new RuntimeException("videoFiles are not found");
    }

    @Override
    public void deleteAllVideoFilesForMovieById(Long id) {

    }
}
