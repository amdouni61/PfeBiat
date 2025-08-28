package com.example.taskflow.model;

import com.example.taskflow.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(name = "full_name")
    private String fullName;

    private String username;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private boolean enabled = true;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Column(name = "is_hidden")
    private Boolean isHidden = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Manual getters and setters since Lombok is not working
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    
    public LocalDateTime getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(LocalDateTime lastActivityAt) { this.lastActivityAt = lastActivityAt; }
    
    public Boolean getIsHidden() { return isHidden; }
    public void setIsHidden(Boolean isHidden) { this.isHidden = isHidden; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastActivityAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isHidden == null || !isHidden;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    public boolean isSessionExpired() {
        if (lastActivityAt == null) {
            // If lastActivityAt is null, the user hasn't been active yet
            // Don't mark them as expired - this is a new or inactive user
            return false;
        }
        
        // For admin users, never expire sessions
        if (role == UserRole.ADMIN) {
            return false;
        }
        
        // Session expires after 24 hours of inactivity (increased from 2 hours)
        return LocalDateTime.now().isAfter(lastActivityAt.plusHours(24));
    }

    public void updateLastActivity() {
        this.lastActivityAt = LocalDateTime.now();
    }
}
