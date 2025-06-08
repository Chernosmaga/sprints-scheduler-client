export function showLoading(container) {
    let taskContainer = document.getElementById(container);
    if (!taskContainer) return;
  
    let html = '';
    for (let i = 0; i < 30; i++) {
      html += `<div class="animate-pulse skeleton h-[120px] mb-1 w-full"></div>`;
    }
    taskContainer.innerHTML = html;
}

export function showLoadingBacklogTasks() {
    let taskContainer = document.getElementById('tasks-container-backlog');
    if (!taskContainer) return;
  
    for (let i = 0; i < 10; i++) {
        let skeleton = document.createElement('div');
        skeleton.innerHTML = `<div class="animate-pulse skeleton h-[80px] mb-1 w-full"></div>`;
        taskContainer.appendChild(skeleton);
    }
}

export function showFirstLoadingBacklogTasks() {
    let taskContainer = document.getElementById('tasks-container-backlog');
    if (!taskContainer) return;
  
    let html = '';
    for (let i = 0; i < 30; i++) {
      html += `<div class="animate-pulse skeleton h-[80px] mb-1 w-full"></div>`;
    }
    taskContainer.innerHTML = html;
}

export function hideLoadingBacklogTasks() {
    let taskContainer = document.getElementById('tasks-container-backlog');
    if (!taskContainer) return;

    let skeletons = taskContainer.querySelectorAll('.skeleton');

    skeletons.forEach(skeleton => {
        skeleton.remove();
    });
}

export function showHistoryLoading() {
  let historyContainer = document.getElementById('history-sprint-content');
  if (!historyContainer) return;

  let html = '';
  for (let i = 0; i < 10; i++) {
    html += `<div class="animate-pulse skeleton h-40 mb-4 w-full"></div>`;
  }
  historyContainer.innerHTML = html;  
}

export function showUserListLoading() {
  let usersContainer = document.getElementById('user-list');
  if (!usersContainer) return;

  let html = '';
  for (let i = 0; i < 10; i++) {
    html += `<div class="animate-pulse skeleton h-20 mb-4 w-full"></div>`;
  }
  usersContainer.innerHTML = html;  
}

export function showCreateSprintLoading() {
  let usersContainer = document.getElementById('include-tasks');
  if (!usersContainer) return;

  let html = ''; 
  for (let i = 0; i < 30; i++) {
    html += `<div class="animate-pulse skeleton h-8 mb-4 w-full"></div>`;
  }
  usersContainer.innerHTML = html;  
}