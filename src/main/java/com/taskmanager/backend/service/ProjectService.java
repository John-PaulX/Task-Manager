package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.ProjectRequest;
import com.taskmanager.backend.dto.ProjectResponse;
import com.taskmanager.backend.entity.Project;
import com.taskmanager.backend.entity.ProjectMember;
import com.taskmanager.backend.entity.Task;
import com.taskmanager.backend.entity.User;
import com.taskmanager.backend.repository.ProjectMemberRepository;
import com.taskmanager.backend.repository.ProjectRepository;
import com.taskmanager.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public ProjectResponse createProject(ProjectRequest request) {
        User currentUser = currentUserService.getCurrentUser();

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCreatedBy(currentUser);
        projectRepository.save(project);

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(currentUser);
        member.setProjectRole(ProjectMember.ProjectRole.ADMIN);
        projectMemberRepository.save(member);

        return mapToResponse(project);
    }

    public List<ProjectResponse> getMyProjects() {
        User currentUser = currentUserService.getCurrentUser();
        List<ProjectMember> memberships = projectMemberRepository.findByUser(currentUser);
        return memberships.stream()
                .map(pm -> mapToResponse(pm.getProject()))
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        checkMembership(project, currentUserService.getCurrentUser());
        return mapToResponse(project);
    }

    public ProjectResponse addMember(Long projectId, String email) {
        User currentUser = currentUserService.getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        checkAdminRole(project, currentUser);

        User newMember = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (projectMemberRepository.existsByProjectAndUser(project, newMember)) {
            throw new RuntimeException("User is already a member");
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(newMember);
        member.setProjectRole(ProjectMember.ProjectRole.MEMBER);
        projectMemberRepository.save(member);

        return mapToResponse(project);
    }

    public void deleteProject(Long projectId) {
        User currentUser = currentUserService.getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        checkAdminRole(project, currentUser);
        projectRepository.delete(project);
    }

    private void checkMembership(Project project, User user) {
        if (!projectMemberRepository.existsByProjectAndUser(project, user)) {
            throw new RuntimeException("Access denied — you are not a member of this project");
        }
    }

    private void checkAdminRole(Project project, User user) {
        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        if (member.getProjectRole() != ProjectMember.ProjectRole.ADMIN) {
            throw new RuntimeException("Access denied — only project admin can do this");
        }
    }

    private ProjectResponse mapToResponse(Project project) {
        List<ProjectResponse.MemberResponse> members = projectMemberRepository
                .findByProject(project)
                .stream()
                .map(pm -> new ProjectResponse.MemberResponse(
                        pm.getUser().getId(),
                        pm.getUser().getName(),
                        pm.getUser().getEmail(),
                        pm.getProjectRole().name()
                ))
                .collect(Collectors.toList());

        long completed = project.getTasks().stream()
                .filter(t -> t.getStatus() == Task.Status.DONE)
                .count();

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedBy().getName(),
                project.getCreatedAt(),
                members,
                project.getTasks().size(),
                (int) completed
        );
    }
}