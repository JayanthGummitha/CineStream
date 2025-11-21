package com.movievibe.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CommanUseApi {

    @GetMapping("/public")
    public String getPublic(){
        return "Hello Jayanth";
    }

    @GetMapping("/private")
    public String getPrivate(){
        return "Hello Jayanth, Good Morning From CineStream";
    }
}
