package com.example.taskflow.util;

import com.example.taskflow.dtos.TaskDTO;
import com.example.taskflow.dtos.TaskStatisticsDTO;
import com.example.taskflow.model.User;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Component
public class ExcelGenerator {

    public byte[] generateTasksExcel(List<TaskDTO> tasks, String sheetName) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Title", "Description", "Status", "Priority", "Assignee", "Due Date", "Created Date", "Type"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 15 * 256);
            }
            
            int rowNum = 1;
            for (TaskDTO task : tasks) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(task.getId());
                row.createCell(1).setCellValue(task.getTitle());
                row.createCell(2).setCellValue(task.getDescription() != null ? task.getDescription() : "");
                row.createCell(3).setCellValue(task.getStatus() != null ? task.getStatus().toString() : "");
                row.createCell(4).setCellValue(task.getPriority() != null ? task.getPriority().toString() : "");
                row.createCell(5).setCellValue(task.getUserFullName() != null ? task.getUserFullName() : "");
                row.createCell(6).setCellValue(task.getDeadline() != null ? task.getDeadline().toString() : "");
                row.createCell(7).setCellValue(task.getCreatedAt() != null ? task.getCreatedAt().toString() : "");
                row.createCell(8).setCellValue(task.getType() != null ? task.getType().toString() : "");
                
                for (int i = 0; i < 9; i++) {
                    row.getCell(i).setCellStyle(dataStyle);
                }
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    public byte[] generateDashboardExcel(TaskStatisticsDTO statistics, List<TaskDTO> recentTasks, 
                                       List<User> activeUsers, String sheetName) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            int rowNum = 0;
            
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("TaskFlow Dashboard Report");
            titleCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));
            
            Row dateRow = sheet.createRow(rowNum++);
            Cell dateCell = dateRow.createCell(0);
            dateCell.setCellValue("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            dateRow.createCell(1).setCellValue("");
            
            rowNum++;
            
            Row statsHeaderRow = sheet.createRow(rowNum++);
            statsHeaderRow.createCell(0).setCellValue("Task Statistics");
            statsHeaderRow.getCell(0).setCellStyle(headerStyle);
            
            Row statsRow1 = sheet.createRow(rowNum++);
            statsRow1.createCell(0).setCellValue("Total Tasks");
            statsRow1.createCell(1).setCellValue(statistics.getTotalTasksCount());
            
            Row statsRow2 = sheet.createRow(rowNum++);
            statsRow2.createCell(0).setCellValue("Completed Tasks");
            statsRow2.createCell(1).setCellValue(statistics.getCompletedTasksCount());
            
            Row statsRow3 = sheet.createRow(rowNum++);
            statsRow3.createCell(0).setCellValue("Pending Tasks");
            statsRow3.createCell(1).setCellValue(statistics.getPendingTasksCount());
            
            Row statsRow4 = sheet.createRow(rowNum++);
            statsRow4.createCell(0).setCellValue("Approved Tasks");
            statsRow4.createCell(1).setCellValue(statistics.getApprovedTasksCount());
            
            rowNum++;
            
            Row tasksHeaderRow = sheet.createRow(rowNum++);
            tasksHeaderRow.createCell(0).setCellValue("Recent Tasks");
            tasksHeaderRow.getCell(0).setCellStyle(headerStyle);
            
            Row tasksTableHeader = sheet.createRow(rowNum++);
            String[] taskHeaders = {"Title", "Status", "Assignee", "Created Date"};
            for (int i = 0; i < taskHeaders.length; i++) {
                Cell cell = tasksTableHeader.createCell(i);
                cell.setCellValue(taskHeaders[i]);
                cell.setCellStyle(headerStyle);
            }
            
            for (TaskDTO task : recentTasks) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(task.getTitle());
                row.createCell(1).setCellValue(task.getStatus() != null ? task.getStatus().toString() : "");
                row.createCell(2).setCellValue(task.getUserFullName() != null ? task.getUserFullName() : "");
                row.createCell(3).setCellValue(task.getCreatedAt() != null ? task.getCreatedAt().toString() : "");
            }
            
            rowNum++;
            
            Row usersHeaderRow = sheet.createRow(rowNum++);
            usersHeaderRow.createCell(0).setCellValue("Active Users");
            usersHeaderRow.getCell(0).setCellStyle(headerStyle);
            
            Row usersTableHeader = sheet.createRow(rowNum++);
            String[] userHeaders = {"Name", "Email", "Role"};
            for (int i = 0; i < userHeaders.length; i++) {
                Cell cell = usersTableHeader.createCell(i);
                cell.setCellValue(userHeaders[i]);
                cell.setCellStyle(headerStyle);
            }
            
            for (User user : activeUsers) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(user.getFullName());
                row.createCell(1).setCellValue(user.getEmail());
                row.createCell(2).setCellValue(user.getRole().toString());
            }
            
            for (int i = 0; i < 9; i++) {
                sheet.setColumnWidth(i, 15 * 256);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    public byte[] generateTeamPerformanceExcel(Map<String, List<TaskDTO>> teamTasks, String sheetName) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            int rowNum = 0;
            
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Team Performance Report");
            titleCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
            
            for (Map.Entry<String, List<TaskDTO>> entry : teamTasks.entrySet()) {
                String teamName = entry.getKey();
                List<TaskDTO> tasks = entry.getValue();
                
                rowNum++;
                Row teamHeaderRow = sheet.createRow(rowNum++);
                Cell teamCell = teamHeaderRow.createCell(0);
                teamCell.setCellValue("Team: " + teamName);
                teamCell.setCellStyle(headerStyle);
                
                Row taskTableHeader = sheet.createRow(rowNum++);
                String[] headers = {"Title", "Status", "Assignee", "Priority", "Due Date"};
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = taskTableHeader.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }
                
                for (TaskDTO task : tasks) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(task.getTitle());
                    row.createCell(1).setCellValue(task.getStatus() != null ? task.getStatus().toString() : "");
                    row.createCell(2).setCellValue(task.getUserFullName() != null ? task.getUserFullName() : "");
                    row.createCell(3).setCellValue(task.getPriority() != null ? task.getPriority().toString() : "");
                    row.createCell(4).setCellValue(task.getDeadline() != null ? task.getDeadline().toString() : "");
                }
            }
            
            for (int i = 0; i < 6; i++) {
                sheet.setColumnWidth(i, 15 * 256);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }
} 