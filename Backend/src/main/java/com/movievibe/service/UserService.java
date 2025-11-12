package com.movievibe.service;

import com.movievibe.modal.User;

public interface UserService {

    User createUser(User user) throws Exception;
    User findUserById(Long id)throws Exception;
    User findUserByName(String name);
    User findUserByEmail(String email);
    User updateUser(Long id,User user);
    void deleteUserByName(String name);
    void delteUserById(Long id);


}
