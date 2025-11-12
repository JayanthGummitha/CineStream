package com.movievibe.service;

import com.movievibe.modal.Subscription;
import com.movievibe.modal.User;
import com.movievibe.modal.UserSubscription;
import com.movievibe.repository.UserRepository;
import com.movievibe.repository.UserSubscription_Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class UserSubscriptionServiceImpl implements UserSubscriptionService{
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserSubscription_Repository userSubscriptionRepository;
    @Autowired
    private SubscriptionService subscriptionService;
    @Override
    public UserSubscription createDefaultSubscription(User User) throws Exception {
        //        userRepository.save(user);
//        User userID=userService.findUserById(user.getId());
//        Subscription planType=subscriptionService.findSubscriptionByName("FreeTrail");
//        if(userID!=null){
//            UserSubscription subscription=new UserSubscription();
//            subscription.setUser(user);
//            subscription.setSubscription(planType);
//            subscription.setCost(planType.getCost());
//            subscription.setStartDate(LocalDate.now());
//            subscription.setEndDate(LocalDate.now().plusMonths(1));
//            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
//            subscription.setPaymentDate(LocalDateTime.now().format(formatter));
//            subscription.setActive(true);
//            return userSubscriptionRepository.save(subscription);
//        }
//        throw new Exception("user not found  or default subscription is not created");
        return null;
    }
    @Override
    public UserSubscription getSubscriptionByUserId(Long userID) throws Exception {
        User user=userService.findUserById(userID);
        if(user!=null){
            return userSubscriptionRepository.findActiveSubscriptionByUserId(user.getId());
        }

        throw new Exception("User Subscription not found by user id");
    }
    @Override
    public List<UserSubscription> findAllUserSubscription(Long userId) {
        return userSubscriptionRepository.findAllSubscriptionByUserId(userId);
    }
    @Override
    public UserSubscription upgradeUserSubscription(Long userId, String planName) throws Exception {
        Optional<User> user=userRepository.findById(userId);

        Subscription newPlan=subscriptionService.findSubscriptionByName(planName);

        if(user.isPresent()){
            if (newPlan.getPlanName()=="Standard"){
                UserSubscription subscription=userSubscriptionRepository.findActiveSubscriptionByUserId(userId);
                subscription.setActive(false);
                userSubscriptionRepository.save(subscription);
                UserSubscription standardSubscription=new UserSubscription();
                standardSubscription.setUser(user.orElse(null));
                standardSubscription.setSubscription(newPlan);
                standardSubscription.setStartDate(LocalDate.now());
                standardSubscription.setEndDate(LocalDate.now().plusMonths(6));
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                standardSubscription.setPaymentDate(LocalDateTime.now().format(formatter));
                standardSubscription.setActive(true);
                return userSubscriptionRepository.save(standardSubscription);
            }
           else {
                UserSubscription sub=userSubscriptionRepository.findActiveSubscriptionByUserId(userId);
                sub.setActive(false);
                userSubscriptionRepository.save(sub);
                UserSubscription premiumSubscription=new UserSubscription();
                premiumSubscription.setUser(user.orElse(null));
                premiumSubscription.setSubscription(newPlan);
                premiumSubscription.setStartDate(LocalDate.now());
                premiumSubscription.setEndDate(LocalDate.now().plusMonths(6));
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                premiumSubscription.setPaymentDate(LocalDateTime.now().format(formatter));
                premiumSubscription.setActive(true);
                return userSubscriptionRepository.save(premiumSubscription);
            }
        }
        else {
            throw new Exception("subscription is not upgraded");
        }

    }

    @Override
    public void deleteUserSubscriptionById(Long userID, Long subsciptionID) throws Exception {
        User user=userService.findUserById(userID);
        UserSubscription userSubscription=userSubscriptionRepository.findActiveSubscriptionByUserId(userID);
        if(user!=null){
            userSubscriptionRepository.deleteById(userSubscription.getId());

        }

        throw new Exception(" Subscription ID is not found by user id ");

    }




}
