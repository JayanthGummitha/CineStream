package com.movievibe.controller;

import com.movievibe.modal.Subscription;
import com.movievibe.repository.SubscriptionRepository;
import com.movievibe.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/subscription")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @PostMapping("/add")
    public ResponseEntity<?>createSubscription(@RequestBody Subscription subscription)throws Exception{
        Subscription sub =subscriptionRepository.findByPlanName(subscription.getPlanName());
        if(sub==null){
            subscriptionService.createSubscription(subscription);
            return  new ResponseEntity<>("subscription plan is added successfully \n"+ subscription, HttpStatus.CREATED);
        }
        return  new ResponseEntity<>(subscription.getPlanName() + " plan is already available", HttpStatus.BAD_REQUEST);
    }
    @GetMapping("/{plan-name}")
    public ResponseEntity<?>getSubscriptionByName(@PathVariable(value = "plan-name")String plan){
        Subscription subscription=subscriptionRepository.findByPlanName(plan);
        if(subscription ==null) {
            return new ResponseEntity<>(plan+" plan is not found", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(subscription,HttpStatus.OK);
    }
    @GetMapping("/all")
    public ResponseEntity<?>getAllSubscription(){
        List<Subscription> subscription=subscriptionService.findAllSubscription();
        if(subscription ==null) {
            return new ResponseEntity<>("All Plans are not found", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(subscription,HttpStatus.OK);
    }
    @PutMapping("/update")
    public ResponseEntity<?>updateSubscriptionByName(@RequestBody Subscription sub) throws Exception {
        Subscription subscription=subscriptionRepository.findByPlanName(sub.getPlanName());

        if(subscription !=null) {

            Subscription Sub=subscriptionService.upgradeSubscription(subscription.getId(),sub);
            return new ResponseEntity<>(Sub, HttpStatus.OK);
        }
        return new ResponseEntity<>("subscription is not found",HttpStatus.BAD_REQUEST);


    }

}
