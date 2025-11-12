package com.movievibe.modal;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Caption {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String src;
    private String label;
    private String kind;
    private String language;
    private String type;
    @ManyToOne
    @JoinColumn(name = "movie_id",referencedColumnName = "id")
    @JsonBackReference(value = "movie-caption")
    private Movie movie;


}
