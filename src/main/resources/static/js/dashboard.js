const API = 'http://localhost:8080';

// Check login
const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'index.html';
}

// Show username in navbar
document.getElementById('user-name').textContent = user.name || 'User';

// Helper — every API call needs this header
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

// ─── Load everything on page open ───
window.onload = async function () {
    await loadProjects();
    await loadStats();
};

// ─── Load Projects ───
async function loadProjects() {
    try {
        const res  = await fetch(`${API}/api/projects`, {
            headers: authHeaders()
        });
        const data = await res.json();

        document.getElementById('total-projects').textContent = data.length;

        const grid = document.getElementById('projects-grid');

        if (data.length === 0) {
            grid.innerHTML = '<p style="color:#888">No projects yet. Create your first one!</p>';
            return;
        }

        grid.innerHTML = data.map(project => {
            const percent = project.totalTasks > 0
                ? Math.round((project.completedTasks / project.totalTasks) * 100)
                : 0;

            return `
                <div class="project-card" onclick="openProject(${project.id})">
                    <h3>${project.name}</h3>
                    <p>${project.description || 'No description'}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${percent}%"></div>
                    </div>
                    <div class="project-meta">
                        <span>${project.totalTasks} tasks · ${project.completedTasks} done</span>
                        <span>${project.members.length} member(s)</span>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        document.getElementById('projects-grid').innerHTML =
            '<p style="color:red">Failed to load projects.</p>';
    }
}

// ─── Load Stats ───
async function loadStats() {
    try {
        // My tasks
        const tasksRes  = await fetch(`${API}/api/tasks/my`, { headers: authHeaders() });
        const tasks     = await tasksRes.json();
        document.getElementById('total-tasks').textContent = tasks.length;
        document.getElementById('done-tasks').textContent  =
            tasks.filter(t => t.status === 'DONE').length;

        // Overdue tasks
        const overdueRes  = await fetch(`${API}/api/tasks/overdue`, { headers: authHeaders() });
        const overdue     = await overdueRes.json();
        document.getElementById('overdue-tasks').textContent = overdue.length;

    } catch (err) {
        console.error('Failed to load stats', err);
    }
}

// ─── Navigate to project page ───
function openProject(projectId) {
    window.location.href = `project.html?id=${projectId}`;
}

// ─── Modal controls ───
function openCreateModal() {
    document.getElementById('create-modal').classList.add('open');
}

function closeCreateModal() {
    document.getElementById('create-modal').classList.remove('open');
    document.getElementById('project-name').value = '';
    document.getElementById('project-desc').value = '';
}

// ─── Create Project ───
async function createProject() {
    const name = document.getElementById('project-name').value.trim();
    const desc = document.getElementById('project-desc').value.trim();

    if (!name) return showAlert('Project name is required');

    try {
        const res = await fetch(`${API}/api/projects`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ name, description: desc })
        });
        const data = await res.json();

        if (!res.ok) {
            showAlert(data.message || 'Failed to create project');
        } else {
            closeCreateModal();
            showAlert('Project created!', 'success');
            await loadProjects();
            await loadStats();
        }
    } catch (err) {
        showAlert('Failed to connect to server');
    }
}

// Close modal if clicking outside
document.getElementById('create-modal').addEventListener('click', function(e) {
    if (e.target === this) closeCreateModal();
});