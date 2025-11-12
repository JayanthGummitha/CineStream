package com.movievibe.service;

import com.movievibe.modal.Subscription;
import com.movievibe.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    @Override
    public Subscription createSubscription(Subscription subscription) throws Exception {

        Subscription sub =subscriptionRepository.findByPlanName(subscription.getPlanName());
        if(sub!=null){
          throw new Exception("Plan type is already available");
        }
        Subscription newPlan=new Subscription();
        newPlan.setPlanName(subscription.getPlanName());
        newPlan.setCost(subscription.getCost());
        newPlan.setDuration(subscription.getDuration());
        subscriptionRepository.save(newPlan);
        return newPlan;
    }

    @Override
    public Subscription findSubscriptionByName(String Name) {

        return  subscriptionRepository.findByPlanName(Name);

    }

    @Override
    public Subscription upgradeSubscription(Long subscriptionId,Subscription subscription)throws Exception {
        Optional<Subscription> sub=subscriptionRepository.findById(subscriptionId);

        if(sub.isEmpty()){
            throw new Exception("Subscription is not found.....");
        }

            Subscription s=sub.get();

            s.setPlanName(subscription.getPlanName());
            s.setCost(subscription.getCost());
            s.setDuration(subscription.getDuration());


            return subscriptionRepository.save(s);


    }

    @Override
    public List<Subscription> findAllSubscription() {
        return subscriptionRepository.findAll();
    }



    @Override
    public void deleteSubscriptionByName(Long id) {

        subscriptionRepository.deleteById(id);

    }
}
