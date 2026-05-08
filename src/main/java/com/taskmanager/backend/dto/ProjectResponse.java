package com.taskmanager.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<MemberResponse> members;
    private int totalTasks;
    private int completedTasks;

    @Data
    @AllArgsConstructor
    public static class MemberResponse {
        private Long userId;
        private String name;
        private String email;
        private String projectRole;
    }
}