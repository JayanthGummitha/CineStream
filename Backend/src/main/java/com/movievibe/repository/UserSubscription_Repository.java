package com.movievibe.repository;

import com.movievibe.modal.User;
import com.movievibe.modal.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserSubscription_Repository extends JpaRepository<UserSubscription,Long> {



    @Query("SELECT u FROM UserSubscription u WHERE u.user.id= :userId and u.Active= true")
    UserSubscription findActiveSubscriptionByUserId(@Param(value = "userId")Long userId);
    @Query("SELECT u FROM UserSubscription u WHERE u.user.id= :userId")
    List<UserSubscription> findAllSubscriptionByUserId(@Param(value = "userId")Long userId);

}
