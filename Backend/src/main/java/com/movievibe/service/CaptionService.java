package com.movievibe.service;


import com.movievibe.modal.Caption;

import java.util.List;
import java.util.Set;

public interface CaptionService {

    Caption createCaption(Long id,Caption caption);
    Caption getCaptionByUsingLabelForMovie(Long id,String label);
    Caption updateCaptionById(Long id,Caption caption);
    void deleteCaptionById(Long id);
    List<Caption> getAllCaptionsById(Long id);
    void deleteAllCaptionsById(Long id);
}
