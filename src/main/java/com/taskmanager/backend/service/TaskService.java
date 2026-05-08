package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.TaskRequest;
import com.taskmanager.backend.dto.TaskResponse;
import com.taskmanager.backend.entity.*;
import com.taskmanager.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public TaskResponse createTask(Long projectId, TaskRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        Project project = getProjectAndCheckAccess(projectId, currentUser);

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setProject(project);
        task.setCreatedBy(currentUser);
        task.setStatus(Task.Status.TODO);

        if (request.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(request.getPriority().toUpperCase()));
        }

        if (request.getAssignedToUserId() != null) {
            User assignee = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(assignee);
        }

        taskRepository.save(task);
        return mapToResponse(task);
    }

    public List<TaskResponse> getTasksByProject(Long projectId) {
        User currentUser = currentUserService.getCurrentUser();
        Project project = getProjectAndCheckAccess(projectId, currentUser);
        return taskRepository.findByProject(project)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse updateTaskStatus(Long taskId, String status) {
        User currentUser = currentUserService.getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        getProjectAndCheckAccess(task.getProject().getId(), currentUser);

        task.setStatus(Task.Status.valueOf(status.toUpperCase()));
        taskRepository.save(task);
        return mapToResponse(task);
    }

    public TaskResponse updateTask(Long taskId, TaskRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        getProjectAndCheckAccess(task.getProject().getId(), currentUser);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());

        if (request.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(request.getPriority().toUpperCase()));
        }

        if (request.getAssignedToUserId() != null) {
            User assignee = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignedTo(assignee);
        }

        taskRepository.save(task);
        return mapToResponse(task);
    }

    public void deleteTask(Long taskId) {
        User currentUser = currentUserService.getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        getProjectAndCheckAccess(task.getProject().getId(), currentUser);
        taskRepository.delete(task);
    }

    public List<TaskResponse> getMyTasks() {
        User currentUser = currentUserService.getCurrentUser();
        return taskRepository.findByAssignedTo(currentUser)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getOverdueTasks() {
        User currentUser = currentUserService.getCurrentUser();
        return taskRepository.findByDueDateBeforeAndStatusNot(LocalDate.now(), Task.Status.DONE)
                .stream()
                .filter(t -> projectMemberRepository.existsByProjectAndUser(t.getProject(), currentUser))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Project getProjectAndCheckAccess(Long projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!projectMemberRepository.existsByProjectAndUser(project, user)) {
            throw new RuntimeException("Access denied");
        }
        return project;
    }

    private TaskResponse mapToResponse(Task task) {
        boolean overdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != Task.Status.DONE;

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().name(),
                task.getPriority().name(),
                task.getDueDate(),
                task.getAssignedTo() != null ? task.getAssignedTo().getName() : null,
                task.getAssignedTo() != null ? task.getAssignedTo().getEmail() : null,
                task.getAssignedTo() != null ? task.getAssignedTo().getId() : null,
                task.getCreatedBy().getName(),
                task.getCreatedAt(),
                overdue
        );
    }
}
