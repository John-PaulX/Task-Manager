const API    = 'http://localhost:8080';
const token  = localStorage.getItem('token');
const user   = JSON.parse(localStorage.getItem('user') || '{}');
const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');

if (!token) window.location.href = 'index.html';
if (!projectId) window.location.href = 'dashboard.html';

document.getElementById('user-name').textContent = user.name || '';

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    };
}

function showAlert(message, type = 'error') {
    document.getElementById('alert-box').innerHTML =
        `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => document.getElementById('alert-box').innerHTML = '', 3000);
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// ─── Load project and tasks on open ───
let projectMembers = [];

window.onload = async function () {
    await loadProject();
    await loadTasks();
};

async function loadProject() {
    try {
        const res  = await fetch(`${API}/api/projects/${projectId}`, { headers: authHeaders() });
        const data = await res.json();

        document.getElementById('project-title').textContent = data.name;
        projectMembers = data.members;

        // Show members
        document.getElementById('members-list').innerHTML = data.members.map(m =>
            `<span class="member-chip">${m.name} (${m.projectRole})</span>`
        ).join('');

        // Populate assignee dropdown
        const select = document.getElementById('task-assignee');
        select.innerHTML = '<option value="">Unassigned</option>';
        data.members.forEach(m => {
            select.innerHTML += `<option value="${m.userId}">${m.name}</option>`;
        });

    } catch (err) {
        showAlert('Failed to load project');
    }
}

async function loadTasks() {
    try {
        const res   = await fetch(`${API}/api/projects/${projectId}/tasks`, { headers: authHeaders() });
        const tasks = await res.json();

        const todo       = tasks.filter(t => t.status === 'TODO');
        const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS');
        const done       = tasks.filter(t => t.status === 'DONE');

        document.getElementById('col-todo').innerHTML       = todo.map(taskCard).join('');
        document.getElementById('col-inprogress').innerHTML = inProgress.map(taskCard).join('');
        document.getElementById('col-done').innerHTML       = done.map(taskCard).join('');

    } catch (err) {
        showAlert('Failed to load tasks');
    }
}

function taskCard(task) {
    const due     = task.dueDate ? `Due: ${task.dueDate}` : 'No due date';
    const assignee = task.assignedToName ? `Assigned to: ${task.assignedToName}` : 'Unassigned';
    const overdueTag = task.overdue ? '<span class="badge badge-overdue">Overdue</span> ' : '';

    const statusOptions = ['TODO', 'IN_PROGRESS', 'DONE']
        .filter(s => s !== task.status)
        .map(s => `<button class="btn btn-outline" style="font-size:11px;padding:4px 8px"
                    onclick="changeStatus(${task.id}, '${s}')">${s.replace('_', ' ')}</button>`)
        .join('');

    return `
        <div class="task-card ${task.priority}">
            <h4>${overdueTag}${task.title}</h4>
            <p style="font-size:12px;color:#888">${task.description || ''}</p>
            <div class="task-meta">
                <div>${assignee}</div>
                <div>${due}</div>
                <div>Priority: ${task.priority}</div>
            </div>
            <div class="task-actions">
                ${statusOptions}
                <button class="btn btn-danger" style="font-size:11px;padding:4px 8px"
                    onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `;
}

async function changeStatus(taskId, status) {
    try {
        await fetch(`${API}/api/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ status })
        });
        await loadTasks();
    } catch (err) {
        showAlert('Failed to update status');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    try {
        await fetch(`${API}/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        showAlert('Task deleted', 'success');
        await loadTasks();
    } catch (err) {
        showAlert('Failed to delete task');
    }
}

// ─── Create Task ───
function openCreateTaskModal() {
    document.getElementById('task-modal').classList.add('open');
}

function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('open');
}

async function createTask() {
    const title    = document.getElementById('task-title').value.trim();
    const desc     = document.getElementById('task-desc').value.trim();
    const priority = document.getElementById('task-priority').value;
    const due      = document.getElementById('task-due').value;
    const assignee = document.getElementById('task-assignee').value;

    if (!title) return showAlert('Task title is required');

    const body = { title, description: desc, priority };
    if (due)      body.dueDate           = due;
    if (assignee) body.assignedToUserId  = parseInt(assignee);

    try {
        const res = await fetch(`${API}/api/projects/${projectId}/tasks`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (!res.ok) {
            showAlert(data.message || 'Failed to create task');
        } else {
            closeTaskModal();
            showAlert('Task created!', 'success');
            await loadTasks();
        }
    } catch (err) {
        showAlert('Failed to connect to server');
    }
}

// ─── Add Member ───
function openAddMemberModal() {
    document.getElementById('member-modal').classList.add('open');
}

function closeMemberModal() {
    document.getElementById('member-modal').classList.remove('open');
}

async function addMember() {
    const email = document.getElementById('member-email').value.trim();
    if (!email) return showAlert('Email is required');

    try {
        const res = await fetch(`${API}/api/projects/${projectId}/members`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (!res.ok) {
            showAlert(data.message || 'Failed to add member');
        } else {
            closeMemberModal();
            showAlert('Member added!', 'success');
            await loadProject();
        }
    } catch (err) {
        showAlert('Failed to connect to server');
    }
}

// Close modals on outside click
document.getElementById('task-modal').addEventListener('click', function(e) {
    if (e.target === this) closeTaskModal();
});
document.getElementById('member-modal').addEventListener('click', function(e) {
    if (e.target === this) closeMemberModal();
});