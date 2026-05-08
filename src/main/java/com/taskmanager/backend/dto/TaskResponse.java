package com.taskmanager.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private String assignedToName;
    private String assignedToEmail;
    private Long assignedToId;
    private String createdByName;
    private LocalDateTime createdAt;
    private boolean overdue;
}