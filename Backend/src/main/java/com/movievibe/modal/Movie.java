package com.movievibe.modal;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String title;
    private String year;
    private String description;

    @ElementCollection(fetch = FetchType.LAZY)
    private List<String> languages;

    @ElementCollection(fetch = FetchType.LAZY)
    private List<String> images;

    @ElementCollection(fetch = FetchType.LAZY)
    private List<String> genres;

    @ElementCollection(fetch = FetchType.LAZY)
    private List<String> filmDirectors;

    @ElementCollection(fetch = FetchType.LAZY)
    private List<String> musicDirectors;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "movie_cast",
            joinColumns = @JoinColumn(name = "movie_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "cast_id", referencedColumnName = "id"))
    private Set<Cast> cast;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "movie-caption")
    private Set<Caption> caption;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "movie-audio")
    private Set<AudioFile> audioFile;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "movie-video")
    private Set<VideoFile> videoFile;

    private String trailer;
    private String thumbnail;
}
