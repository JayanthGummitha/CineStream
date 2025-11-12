package com.movievibe.service;

import com.movievibe.modal.Subscription;
import com.movievibe.modal.User;
import com.movievibe.modal.UserSubscription;
import com.movievibe.repository.SubscriptionRepository;
import com.movievibe.repository.UserRepository;
import com.movievibe.repository.UserSubscription_Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService{

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserSubscription_Repository userSubscriptionRepository;
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Override
    public User createUser(User user)throws Exception {
        User userID=userRepository.findByFirstName(user.getEmail());


        if(userID!=null){
           throw new Exception("User is already registered");

        }
        User newUser=new User();
        newUser.setFirstName(user.getFirstName());
        newUser.setLastName(user.getLastName());
        newUser.setEmail(user.getEmail());
        newUser.setPassword(user.getPassword());
        newUser.setMovieVibePin(user.getMovieVibePin());
        userRepository.save(user);
        Subscription planType=subscriptionRepository.findByPlanName("FreeTrail");
        UserSubscription subscription = new UserSubscription();
        subscription.setUser(user);
        subscription.setSubscription(planType);
        subscription.setCost(planType.getCost());
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusMonths(1));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        subscription.setPaymentDate(LocalDateTime.now().format(formatter));
        subscription.setActive(true);
        userSubscriptionRepository.save(subscription);

        return newUser;
    }

    @Override
    public User findUserById(Long id)throws Exception {


        Optional<User> optionalUser=userRepository.findById(id);

        if(optionalUser.isEmpty()) {
            throw new RuntimeException("user not found");


        }
        return optionalUser.get();
    }

    @Override
    public User findUserByName(String name) {
        User user=userRepository.findByFirstName(name);

        return user;
    }

    @Override
    public User findUserByEmail(String email) {
        User findUserByMail=userRepository.findByEmail(email);
        if(findUserByMail!=null){
            return findUserByMail;
        }
        throw new RuntimeException("User not found");
    }

    @Override
    public User updateUser(Long id,User user) {
        Optional<User> userId= userRepository.findById(id);
        if(userId.isPresent()) {
            User updateUser = userId.get();
            updateUser.setFirstName(user.getFirstName());
            updateUser.setLastName(user.getLastName());
            updateUser.setEmail(user.getEmail());
            updateUser.setPassword(user.getPassword());
            updateUser.setMovieVibePin(user.getMovieVibePin());
            return userRepository.save(updateUser);
        }
        throw new RuntimeException("User details not updated");
    }

    @Override
    public void deleteUserByName(String name) {
        User user= userRepository.findByFirstName(name);
        userRepository.delete(user);

    }

    @Override
    public void delteUserById(Long id) {
        Optional<User> user= userRepository.findById(id);
        User deleteUser=user.get();
        userRepository.delete(deleteUser);

    }
}
