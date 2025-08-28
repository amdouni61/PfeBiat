package com.example.taskflow.service;


import com.example.taskflow.dtos.CommentDTO;
import com.example.taskflow.dtos.TaskDTO;
import com.example.taskflow.dtos.TaskStatisticsDTO;
import com.example.taskflow.model.Task;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;


public interface TaskService {


    List<TaskDTO> getAllTasks();


    TaskDTO getTaskById(Long id);


    TaskDTO createTask(TaskDTO taskDTO);


    TaskDTO updateTask(Long id, TaskDTO taskDTO);


    void deleteTask(Long id);

    List<TaskDTO> getTasksByUser(Long userId);

    List<TaskDTO> getTasksBySupervisor(Long supervisorId);

    List<TaskDTO> getTasksByStatus(Task.TaskStatus status);

    List<TaskDTO> getTasksByDate(LocalDate date);
    List<TaskDTO> getTasksByDateRange(LocalDate startDate, LocalDate endDate);

    TaskDTO approveTask(Long id, CommentDTO comment);

    TaskDTO rejectTask(Long id, CommentDTO comment);

    boolean isTaskCreatedByCurrentUser(Long taskId);

    List<TaskDTO> getCurrentUserTasks();

    TaskStatisticsDTO getTaskStatistics();

    List<TaskDTO> getRecentTasks(int limit);

    List<TaskDTO> getRelatedTasks(Long taskId);

    Map<String, List<TaskDTO>> getTasksByTeam();

    List<TaskDTO> getFilteredTasks(Map<String, Object> filters);

    List<TaskDTO> getTasksByUserId(Long userId);
    
    List<TaskDTO> getDashboardTasks();

    TaskDTO submitTaskForValidation(Long taskId);
    
    TaskDTO validateTask(Long taskId, boolean approved, String comment, String rejectionReason);
    
    List<TaskDTO> getTasksPendingValidation();
    
    List<TaskDTO> getTasksByStatusForCurrentUser(Task.TaskStatus status);
    
    List<TaskDTO> getDraftTasksForCurrentUser();
    
    List<TaskDTO> getSubmittedTasksForCurrentUser();
}
