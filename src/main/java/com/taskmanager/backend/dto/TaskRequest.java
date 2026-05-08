package com.taskmanager.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;
    private String priority;
    private LocalDate dueDate;
    private Long assignedToUserId;
}