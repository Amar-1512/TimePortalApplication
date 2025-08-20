package com.example.timeentrysystem;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.example.timeentrysystem.entity.User;
import com.example.timeentrysystem.repository.UserRepository;
import com.example.timeentrysystem.service.UserService;

@SpringBootApplication
public class TimeEntrySystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(TimeEntrySystemApplication.class, args);
    }
    @Bean
    public CommandLineRunner createDefaultAdmin(UserRepository userRepository, UserService userService) {
        return args -> {
            if (userRepository.count() == 0) {
                User adminUser = new User();
                adminUser.setEmail("admin@adroit.com");
                adminUser.setPassword("admin123"); 
                adminUser.setRole("admin");
                adminUser.setStatus("active");
                adminUser.setDisplayName("Admin");
 
                try {
                    userService.createUser(adminUser);
                    System.out.println("Default admin user created with email: admin@example.com and password: admin123");
                } catch (Exception e) {
                    System.err.println("Failed to create default admin user: " + e.getMessage());
                }
            }
        };
    }
}
