package com.example.taskflow.conrollers;

import com.example.taskflow.dtos.TaskDTO;
import com.example.taskflow.dtos.TaskStatisticsDTO;
import com.example.taskflow.dtos.UserDTO;
import com.example.taskflow.model.User;
import com.example.taskflow.service.TaskService;
import com.example.taskflow.service.UserService;
import com.example.taskflow.util.PDFGenerator;
import com.example.taskflow.util.ExcelGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "http://localhost:4200")
public class PDFExportController {

    @Autowired
    private PDFGenerator pdfGenerator;
    
    @Autowired
    private ExcelGenerator excelGenerator;
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/pdf/tasks")
    public ResponseEntity<ByteArrayResource> exportTasksPDF(@RequestParam(defaultValue = "All Tasks Report") String title) {
        try {
            List<TaskDTO> tasks = taskService.getAllTasks();
            byte[] pdfBytes = pdfGenerator.generateTasksReport(tasks, title);
            
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tasks-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/excel/tasks")
    public ResponseEntity<ByteArrayResource> exportTasksExcel(@RequestParam(defaultValue = "Tasks") String sheetName) {
        try {
            List<TaskDTO> tasks = taskService.getAllTasks();
            byte[] excelBytes = excelGenerator.generateTasksExcel(tasks, sheetName);
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tasks-report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pdf/dashboard")
    public ResponseEntity<ByteArrayResource> exportDashboardPDF(@RequestParam(defaultValue = "Dashboard Report") String title) {
        try {
            TaskStatisticsDTO statistics = taskService.getTaskStatistics();
            List<TaskDTO> recentTasks = taskService.getRecentTasks(10);
            List<UserDTO> activeUserDTOs = userService.getActiveUsers();
            
            List<User> activeUsers = activeUserDTOs.stream()
                .map(userDTO -> {
                    User user = new User();
                    user.setId(userDTO.getId());
                    user.setFullName(userDTO.getFullName());
                    user.setEmail(userDTO.getEmail());
                    user.setRole(userDTO.getRole());
                    return user;
                })
                .collect(Collectors.toList());
            
            byte[] pdfBytes = pdfGenerator.generateDashboardReport(statistics, recentTasks, activeUsers, title);
            
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dashboard-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/excel/dashboard")
    public ResponseEntity<ByteArrayResource> exportDashboardExcel(@RequestParam(defaultValue = "Dashboard") String sheetName) {
        try {
            TaskStatisticsDTO statistics = taskService.getTaskStatistics();
            List<TaskDTO> recentTasks = taskService.getRecentTasks(10);
            List<UserDTO> activeUserDTOs = userService.getActiveUsers();
            
            List<User> activeUsers = activeUserDTOs.stream()
                .map(userDTO -> {
                    User user = new User();
                    user.setId(userDTO.getId());
                    user.setFullName(userDTO.getFullName());
                    user.setEmail(userDTO.getEmail());
                    user.setRole(userDTO.getRole());
                    return user;
                })
                .collect(Collectors.toList());
            
            byte[] excelBytes = excelGenerator.generateDashboardExcel(statistics, recentTasks, activeUsers, sheetName);
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dashboard-report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pdf/task/{taskId}")
    public ResponseEntity<ByteArrayResource> exportTaskDetailsPDF(@PathVariable Long taskId) {
        try {
            TaskDTO task = taskService.getTaskById(taskId);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            
            List<TaskDTO> relatedTasks = taskService.getRelatedTasks(taskId);
            
            byte[] pdfBytes = pdfGenerator.generateTaskDetails(task, relatedTasks);
            
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"task-" + taskId + "-details.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/excel/task/{taskId}")
    public ResponseEntity<ByteArrayResource> exportTaskDetailsExcel(@PathVariable Long taskId) {
        try {
            TaskDTO task = taskService.getTaskById(taskId);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            
            List<TaskDTO> relatedTasks = taskService.getRelatedTasks(taskId);
            relatedTasks.add(0, task);
            
            byte[] excelBytes = excelGenerator.generateTasksExcel(relatedTasks, "Task Details");
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"task-" + taskId + "-details.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pdf/team-performance")
    public ResponseEntity<ByteArrayResource> exportTeamPerformancePDF(@RequestParam(defaultValue = "Team Performance Report") String title) {
        try {
            Map<String, List<TaskDTO>> teamTasks = taskService.getTasksByTeam();
            
            byte[] pdfBytes = pdfGenerator.generateTeamReport(teamTasks, title);
            
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"team-performance-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/excel/team-performance")
    public ResponseEntity<ByteArrayResource> exportTeamPerformanceExcel(@RequestParam(defaultValue = "Team Performance") String sheetName) {
        try {
            Map<String, List<TaskDTO>> teamTasks = taskService.getTasksByTeam();
            
            byte[] excelBytes = excelGenerator.generateTeamPerformanceExcel(teamTasks, sheetName);
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"team-performance-report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/pdf/tasks/filtered")
    public ResponseEntity<ByteArrayResource> exportFilteredTasksPDF(@RequestBody Map<String, Object> filters,
                                                                  @RequestParam(defaultValue = "Filtered Tasks Report") String title) {
        try {
            List<TaskDTO> tasks = taskService.getFilteredTasks(filters);
            byte[] pdfBytes = pdfGenerator.generateTasksReport(tasks, title);
            
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"filtered-tasks-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/excel/tasks/filtered")
    public ResponseEntity<ByteArrayResource> exportFilteredTasksExcel(@RequestBody Map<String, Object> filters,
                                                                    @RequestParam(defaultValue = "Filtered Tasks") String sheetName) {
        try {
            List<TaskDTO> tasks = taskService.getFilteredTasks(filters);
            byte[] excelBytes = excelGenerator.generateTasksExcel(tasks, sheetName);
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"filtered-tasks-report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pdf/user/{userId}/tasks")
    public ResponseEntity<ByteArrayResource> exportUserTasksPDF(@PathVariable Long userId,
                                                              @RequestParam(defaultValue = "User Tasks Report") String title) {
        try {
            List<TaskDTO> tasks = taskService.getTasksByUserId(userId);
            byte[] pdfBytes = pdfGenerator.generateTasksReport(tasks, title);
            
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"user-" + userId + "-tasks.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/excel/user/{userId}/tasks")
    public ResponseEntity<ByteArrayResource> exportUserTasksExcel(@PathVariable Long userId,
                                                                @RequestParam(defaultValue = "User Tasks") String sheetName) {
        try {
            List<TaskDTO> tasks = taskService.getTasksByUserId(userId);
            byte[] excelBytes = excelGenerator.generateTasksExcel(tasks, sheetName);
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"user-" + userId + "-tasks.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelBytes.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 