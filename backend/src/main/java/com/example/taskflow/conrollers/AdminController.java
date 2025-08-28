package com.example.taskflow.conrollers;

import com.example.taskflow.dtos.CreateUserDto;
import com.example.taskflow.dtos.UserDTO;
import com.example.taskflow.model.enums.UserRole;
import com.example.taskflow.responses.ErrorResponse;
import com.example.taskflow.service.EmailService;
import com.example.taskflow.service.imp.UserServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR')")
public class AdminController {

    private final UserServiceImpl userService;
    private final EmailService emailService;

    public AdminController(UserServiceImpl userService, EmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody CreateUserDto createUserDto) {
        try {
            // Convert CreateUserDto to UserDTO
            UserDTO userDTO = new UserDTO();
            userDTO.setFullName(createUserDto.getFullName());
            userDTO.setEmail(createUserDto.getEmail());
            userDTO.setPassword(createUserDto.getPassword());
            userDTO.setRole(createUserDto.getRole());
            userDTO.setAvatarUrl(createUserDto.getAvatarUrl());
            userDTO.setUsername(createUserDto.getEmail()); // Use email as username
            userDTO.setEnabled(true); // Admin created users are enabled by default

            UserDTO createdUser = userService.createUser(userDTO);
            
            // Send email with credentials
            emailService.sendUserCredentials(
                createUserDto.getEmail(),
                createUserDto.getPassword(),
                createUserDto.getFullName(),
                createUserDto.getRole()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception ex) {
            ErrorResponse errorResponse = new ErrorResponse("USER_CREATION_ERROR", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        System.out.println("🔍 AdminController.getAllUsers() called");
        List<UserDTO> users = userService.getAllUsers();
        System.out.println("🔍 Users found: " + users.size());
        System.out.println("🔍 Users data: " + users);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        Optional<UserDTO> userOpt = userService.getUserById(id);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDTO updateUserDto) {
        try {
            // Convert CreateUserDto to UserDTO
            UserDTO updatedUser = userService.updateUser(id, updateUserDto);

            return ResponseEntity.ok(updatedUser);
        } catch (Exception ex) {
            ErrorResponse errorResponse = new ErrorResponse("USER_UPDATE_ERROR", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            ErrorResponse errorResponse = new ErrorResponse("USER_DELETE_ERROR", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam UserRole role) {
        try {
            Optional<UserDTO> userOpt = userService.getUserById(id);
            if (userOpt.isPresent()) {
                UserDTO currentUser = userOpt.get();
                currentUser.setRole(role);
                UserDTO updatedUser = userService.updateUser(id, currentUser);
                return ResponseEntity.ok(updatedUser);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            ErrorResponse errorResponse = new ErrorResponse("ROLE_UPDATE_ERROR", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
} 