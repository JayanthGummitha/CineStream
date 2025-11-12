package com.movievibe.service;

import com.movievibe.modal.User;
import com.movievibe.modal.UserSubscription;

import java.util.List;

public interface UserSubscriptionService {

    UserSubscription createDefaultSubscription(User User)throws Exception;
    UserSubscription getSubscriptionByUserId(Long userId) throws Exception;
    List<UserSubscription> findAllUserSubscription(Long userId);
      UserSubscription upgradeUserSubscription(Long UserId,String planName)throws Exception;
    void deleteUserSubscriptionById(Long UserId,Long subsciptionID)throws Exception;
}
