export function showLoading(container) {
    let taskContainer = document.getElementById(container);
    if (!taskContainer) return;
  
    let html = '';
    for (let i = 0; i < 30; i++) {
      html += `<div class="animate-pulse skeleton h-[120px] mb-4 w-full"></div>`;
    }
    taskContainer.innerHTML = html;
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
    html += `<div class="animate-pulse skeleton h-16 mb-4 w-full"></div>`;
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