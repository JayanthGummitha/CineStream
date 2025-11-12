package com.movievibe.service;

import com.movievibe.modal.Subscription;

import java.util.List;
import java.util.Optional;

public interface SubscriptionService {

    Subscription createSubscription(Subscription subscription) throws Exception;
    Subscription findSubscriptionByName(String Name);
    Subscription upgradeSubscription(Long subscriptionId,Subscription subscription)throws Exception;
    void deleteSubscriptionByName(Long id);
    List<Subscription> findAllSubscription();

}
