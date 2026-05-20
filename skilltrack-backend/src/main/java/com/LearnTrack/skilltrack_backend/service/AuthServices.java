package com.LearnTrack.skilltrack_backend.service;

import com.LearnTrack.skilltrack_backend.dto.LoginResponse;
import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.entity.EmployeeInvite;
import com.LearnTrack.skilltrack_backend.repository.EmployeeRepository;
import com.LearnTrack.skilltrack_backend.repository.InviteResitory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
public class AuthServices {

    @Autowired
    private InviteResitory inviteRepository;

    @Autowired
    private EmployeeRepository repository;



//    public LoginResponse login(String email, String password){
//
//        EmployeeEntity employee =
//                repository.findByEmail(email)
//                        .orElseThrow(() -> new RuntimeException("User Not Found"));
//
//        if(!employee.getPassword().equals(password)){
//            throw new RuntimeException("Invalid Password");
//        }
//
//        return new LoginResponse(
//                employee.getId(),
//                employee.getName(),
//                employee.getEmail(),
//                employee.getRole()
//        );
//    }

    public EmployeeEntity login(String email, String password) {

        EmployeeEntity user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }



        return user;
    }

    public EmployeeEntity registerEmployee(EmployeeEntity employee,String token) {

        if(employee.getPassword() == null || employee.getPassword().isEmpty()){
            throw new RuntimeException("Password cannot be empty");
        }

        EmployeeInvite invite = inviteRepository.findByToken(token).orElseThrow(()-> new RuntimeException("Invalid Token"));

        if (invite.getExpiryAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invite link expired");
        }

        employee.setRole("EMPLOYEE");

        return repository.save(employee);
    }


}
