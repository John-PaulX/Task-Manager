package com.taskmanager.backend.repository;

import com.taskmanager.backend.entity.Project;
import com.taskmanager.backend.entity.Task;
import com.taskmanager.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignedTo(User user);
    List<Task> findByAssignedToAndStatus(User user, Task.Status status);
    List<Task> findByDueDateBeforeAndStatusNot(LocalDate date, Task.Status status);
}
