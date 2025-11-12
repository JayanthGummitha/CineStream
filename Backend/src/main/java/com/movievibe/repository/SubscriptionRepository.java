package com.movievibe.repository;

import com.movievibe.modal.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription,Long> {

    Subscription findByPlanName(String name);

}
