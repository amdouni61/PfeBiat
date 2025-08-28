package com.example.taskflow.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tasks")
public class Task {

    public enum TaskStatus {
        DRAFT,
        SUBMITTED,
        PENDING,
        APPROVED,
        REJECTED,
        COMPLETED
    }

    public enum TaskPriority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    public enum TaskType {
        DEVELOPMENT,
        TESTING,
        MEETING,
        PLANNING,
        SUPPORT,
        DOCUMENTATION,
        MAINTENANCE,
        DEPLOYMENT,
        TRAINING,
        OTHER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskType type;

    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate deadline;
    private String attachmentUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supervisor_id")
    private User supervisor;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    public Task() {}

    public Task(Long id, String title, String description, TaskType type, TaskStatus status, TaskPriority priority, LocalDate date,
                LocalTime startTime, LocalTime endTime, LocalDate deadline, String attachmentUrl, User user, User supervisor,
                Set<Comment> comments, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime submittedAt,
                LocalDateTime validatedAt, LocalDateTime rejectedAt, String rejectionReason) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.status = status;
        this.priority = priority;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.deadline = deadline;
        this.attachmentUrl = attachmentUrl;
        this.user = user;
        this.supervisor = supervisor;
        this.comments = comments;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.submittedAt = submittedAt;
        this.validatedAt = validatedAt;
        this.rejectedAt = rejectedAt;
        this.rejectionReason = rejectionReason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskType getType() {
        return type;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getSupervisor() {
        return supervisor;
    }

    public void setSupervisor(User supervisor) {
        this.supervisor = supervisor;
    }

    public Set<Comment> getComments() {
        return comments;
    }

    public void setComments(Set<Comment> comments) {
        this.comments = comments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getValidatedAt() {
        return validatedAt;
    }

    public void setValidatedAt(LocalDateTime validatedAt) {
        this.validatedAt = validatedAt;
    }

    public LocalDateTime getRejectedAt() {
        return rejectedAt;
    }

    public void setRejectedAt(LocalDateTime rejectedAt) {
        this.rejectedAt = rejectedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public boolean canBeSubmitted() {
        return this.status == TaskStatus.DRAFT;
    }

    public boolean canBeValidated() {
        return this.status == TaskStatus.SUBMITTED;
    }

    public boolean canBeRejected() {
        return this.status == TaskStatus.SUBMITTED;
    }

    public boolean canBeEdited() {
        return this.status == TaskStatus.DRAFT || this.status == TaskStatus.REJECTED;
    }

    public boolean canBeDeleted() {
        return this.status == TaskStatus.DRAFT;
    }
}
