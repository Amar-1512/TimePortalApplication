package com.example.timeentrysystem.service;
 
import com.example.timeentrysystem.entity.User;
import com.example.timeentrysystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
 
import java.util.Collections;
import java.util.Optional;
 
@Service
public class UserService implements UserDetailsService {
 
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
 
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
 
    public User createUser(User user) throws IllegalArgumentException {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setStatus("active");
        return userRepository.save(user);
    }
 
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
 
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }
 
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
 
        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            user.getStatus().equals("active"),
            true,
            true,
            true,
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()))
        );
    }
 
    public boolean changePassword(String email, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return false;
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }
}