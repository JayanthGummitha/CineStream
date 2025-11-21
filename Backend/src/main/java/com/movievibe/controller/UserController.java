package com.movievibe.controller;

import com.movievibe.modal.Subscription;
import com.movievibe.modal.User;
import com.movievibe.modal.UserSubscription;
import com.movievibe.repository.SubscriptionRepository;
import com.movievibe.repository.UserRepository;
import com.movievibe.repository.UserSubscription_Repository;
import com.movievibe.service.UserService;
import com.movievibe.service.UserServiceImpl;
import com.movievibe.service.UserSubscriptionService;
import com.movievibe.service.UserSubscriptionServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {


    @Autowired
    private UserServiceImpl userServiceImpl;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private UserSubscription_Repository userSubscriptionRepository;
    @Autowired
    private UserSubscriptionService userSubscriptionService;

    @PostMapping("/new")
    public ResponseEntity<?> createUserAccount(@RequestBody User user) throws Exception {


            User newUser =userServiceImpl.createUser(user);
            if(newUser!=null){
                return new ResponseEntity<>(newUser, HttpStatus.CREATED);
            }
        return new ResponseEntity<>("new User and Subscription plan is not created",HttpStatus.BAD_REQUEST);

    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserAccount(@PathVariable Long id)throws Exception{
        User user=userServiceImpl.findUserById(id);
        if(user!=null){
            return new ResponseEntity<>(user,HttpStatus.OK);
        }
        return new ResponseEntity<>("User not found ",HttpStatus.NOT_FOUND);
    }
    @GetMapping("/find/{email}")
    public ResponseEntity<?> getUserAccountByEmail(@PathVariable String email)throws Exception{
        User user=userServiceImpl.findUserByEmail(email);
        if(user!=null){
            return new ResponseEntity<>(user,HttpStatus.OK);
        }
        return new ResponseEntity<>("User not found with "+email,HttpStatus.NOT_FOUND);
    }
    @PutMapping("/account/update")
    public ResponseEntity<?> updateUserAccount(@RequestBody User user) throws Exception {


        User newUser =userRepository.findByEmail(user.getEmail());
        if(newUser!=null){
            User updateUser=userService.updateUser(newUser.getId(),user);
            return new ResponseEntity<>(user.getFirstName()+"your Account details is updated : \n "+updateUser, HttpStatus.CREATED);
        }
        return new ResponseEntity<>("new User and Subscription plan is not created",HttpStatus.BAD_REQUEST);

    }

    @GetMapping("/subscription/{id}")
    public ResponseEntity<?>getSubscriptionByUserId(@PathVariable Long id) throws Exception {

        UserSubscription subscription=userSubscriptionService.getSubscriptionByUserId(id);
        if(subscription==null){
           return new ResponseEntity<>("Subscription of user is not found",HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(subscription, HttpStatus.OK);
    }

}
