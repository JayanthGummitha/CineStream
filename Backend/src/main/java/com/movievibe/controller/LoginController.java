package com.movievibe.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
public class LoginController {

    @GetMapping("/time")
    public ResponseEntity<?> getTime(){
       LocalDateTime name;
       name=LocalDateTime.now();

        return new ResponseEntity<>(name, HttpStatus.OK);
    }
}
