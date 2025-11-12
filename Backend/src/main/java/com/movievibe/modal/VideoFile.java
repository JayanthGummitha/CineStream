package com.movievibe.modal;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoFile {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String src;
    private String type;
    private String width;
    private String height;
    @ManyToOne
    @JoinColumn(name = "movie_id",referencedColumnName = "id")
    @JsonBackReference(value = "movie-video")
    private Movie movie;


}


