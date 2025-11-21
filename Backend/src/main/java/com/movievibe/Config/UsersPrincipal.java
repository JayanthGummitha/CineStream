package com.movievibe.Config;

import com.movievibe.modal.User;

import com.movievibe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsersPrincipal implements UserDetailsService {

    @Autowired
    private UserRepository usersRepo;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User users=usersRepo.findByFirstName(username);
        if(users == null){
            System.out.println("user not found");
            throw new UsernameNotFoundException("user not found");
        }
        return new UserDetail(users);
    }
}
