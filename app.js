// ========================================
// FOCUSFLOW - APP DASHBOARD JAVASCRIPT
// ========================================

// ========================================
// CONSTANTS & STATE
// ========================================
const STORAGE_KEYS = {
    USER: 'focusflow_user',
    LOGGED_IN: 'focusflow_logged_in',
    TASKS: 'focusflow_tasks',
    POMODORO: 'focusflow_pomodoro',
    STREAK: 'focusflow_streak',
    GOALS: 'focusflow_goals',
    HABITS: 'focusflow_habits',
    NOTES: 'focusflow_notes',
    ACHIEVEMENTS: 'focusflow_achievements',
    SETTINGS: 'focusflow_settings',
    CALENDAR_DATE: 'focusflow_calendar_date'
};

// Development mode flag - set to false to enforce login in production
const DEV_MODE = true;

// App State
let appState = {
    currentSection: 'dashboard',
    tasks: [],
    habits: [],
    notes: [],
    goals: { daily: [], weekly: [] },
    pomodoro: {
        timeLeft: 25 * 60,
        isRunning: false,
        isBreak: false,
        session: 1,
        interval: null
    },
    streak: { current: 0, longest: 0, lastActiveDate: null },
    achievements: {
        badges: [],
        firstTask: false,
        sevenDayStreak: false,
        tenPomodoros: false,
        fiftyTasks: false
    },
    settings: {
        theme: 'dark',
        accentColor: '#6366f1',
        pomodoroWork: 25,
        pomodoroBreak: 5,
        pomodoroLongBreak: 15,
        autoStartBreak: false,
        soundEnabled: true
    },
    calendarDate: new Date(),
    selectedDate: null,
    taskFilter: 'today'
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('[FocusFlow] DOMContentLoaded fired, initializing...');
    
    // Check if user is logged in (with dev mode bypass)
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.LOGGED_IN);
    console.log('[FocusFlow] Login status:', isLoggedIn ? 'logged in' : 'not logged in');
    
    if (!isLoggedIn && !DEV_MODE) {
        console.log('[FocusFlow] Redirecting to login...');
        window.location.href = 'login.html';
        return;
    } else if (!isLoggedIn && DEV_MODE) {
        console.log('[FocusFlow] DEV_MODE: Bypassing login, setting mock user');
        localStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ name: 'Dev User', plan: 'Pro' }));
    }
    
    console.log('[FocusFlow] Initializing data...');
    // Initialize data
    initializeData();
    
    // Load user info
    loadUserInfo();
    
    console.log('[FocusFlow] Initializing navigation...');
    // Initialize components
    initNavigation();
    initModals();
    initPomodoro();
    
    console.log('[FocusFlow] Loading and rendering data...');
    // Load all data and render
    loadAllData();
    renderDashboard();
    renderTasks();
    renderHabits();
    renderGoals();
    renderNotes();
    renderInsights();
    renderAchievements();
    renderCalendar();
    
    // Apply settings
    applySettings();
    
    // Set current date
    const today = new Date();
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    console.log('[FocusFlow] Initialization complete!');
});

function initializeData() {
    // Initialize tasks
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
    }
    
    // Initialize pomodoro
    if (!localStorage.getItem(STORAGE_KEYS.POMODORO)) {
        localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify({
            totalSessions: 0,
            totalMinutes: 0,
            todaySessions: 0,
            todayMinutes: 0,
            lastDate: null
        }));
    }
    
    // Initialize streak
    if (!localStorage.getItem(STORAGE_KEYS.STREAK)) {
        localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify({
            current: 0,
            longest: 0,
            lastActiveDate: null
        }));
    }
    
    // Initialize goals
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify({
            daily: [],
            weekly: []
        }));
    }
    
    // Initialize habits
    if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify([]));
    }
    
    // Initialize notes
    if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
    }
    
    // Initialize achievements
    if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify({
            badges: [],
            firstTask: false,
            sevenDayStreak: false,
            tenPomodoros: false,
            fiftyTasks: false
        }));
    }
    
    // Initialize settings
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
            theme: 'dark',
            accentColor: '#6366f1',
            pomodoroWork: 25,
            pomodoroBreak: 5,
            pomodoroLongBreak: 15,
            autoStartBreak: false,
            soundEnabled: true
        }));
    }
}

function loadAllData() {
    // Load tasks
    appState.tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    
    // Load habits
    appState.habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
    
    // Load notes
    appState.notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    
    // Load goals
    appState.goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '{"daily":[],"weekly":[]}');
    
    // Load streak
    appState.streak = JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK) || '{"current":0,"longest":0,"lastActiveDate":null}');
    
    // Load achievements
    appState.achievements = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || '{"badges":[],"firstTask":false,"sevenDayStreak":false,"tenPomodoros":false,"fiftyTasks":false}');
    
    // Load settings
    appState.settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    
    // Check and update streak
    checkAndUpdateStreak();
}

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    if (user.name) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userInitials').textContent = getInitials(user.name);
        document.getElementById('userPlan').textContent = (user.plan || 'Free');
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileAvatar').textContent = getInitials(user.name);
        document.getElementById('profilePlan').textContent = (user.plan || 'free') + ' Plan';
    }
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function applySettings() {
    // Apply theme
    if (appState.settings.theme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        document.getElementById('themeToggle').checked = true;
    }
    
    // Apply accent color
    if (appState.settings.accentColor) {
        document.documentElement.style.setProperty('--accent-primary', appState.settings.accentColor);
    }
    
    // Apply pomodoro settings
    if (appState.settings.pomodoroWork) {
        document.getElementById('pomodoroWork').value = appState.settings.pomodoroWork;
    }
    if (appState.settings.pomodoroBreak) {
        document.getElementById('pomodoroBreak').value = appState.settings.pomodoroBreak;
    }
    if (appState.settings.pomodoroLongBreak) {
        document.getElementById('pomodoroLongBreak').value = appState.settings.pomodoroLongBreak;
    }
    if (appState.settings.autoStartBreak) {
        document.getElementById('autoStartBreak').checked = true;
    }
    if (appState.settings.soundEnabled) {
        document.getElementById('soundEnabled').checked = true;
    }
    
    // Update pomodoro timer display
    appState.pomodoro.timeLeft = appState.settings.pomodoroWork * 60;
    updatePomodoroDisplay();
}

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    console.log('[FocusFlow] initNavigation called');
    
    // Sidebar navigation - support both data-target and data-section attributes
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-target], .sidebar-nav .nav-item[data-section]');
    console.log('[FocusFlow] Found sidebar nav items:', navItems.length);
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Try data-target first, then data-section
            let target = item.getAttribute('data-target') || item.getAttribute('data-section');
            console.log('[FocusFlow] Sidebar nav clicked, navigating to:', target);
            navigateTo(target);
        });
    });
    
    // Mobile bottom navigation - support both data-target and data-section
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item[data-target], .bottom-nav-item[data-section]');
    console.log('[FocusFlow] Found bottom nav items:', bottomNavItems.length);
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            let target = item.getAttribute('data-target') || item.getAttribute('data-section');
            console.log('[FocusFlow] Bottom nav clicked, navigating to:', target);
            navigateTo(target);
        });
    });
    
    // Mobile menu toggle - support both .sidebar.active and .sidebar.open
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.app-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            console.log('[FocusFlow] Mobile menu toggle clicked');
            // Toggle both .open and .active classes for compatibility
            sidebar.classList.toggle('open');
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            console.log('[FocusFlow] Overlay clicked, closing sidebar');
            sidebar.classList.remove('open');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    console.log('[FocusFlow] Navigation initialized');
}

function navigateTo(sectionId) {
    console.log('[FocusFlow] navigateTo called with sectionId:', sectionId);
    
    if (!sectionId) {
        console.warn('[FocusFlow] No sectionId provided to navigateTo');
        return;
    }
    
    // Update nav items (support both data-target and data-section)
    document.querySelectorAll('.nav-item[data-target], .nav-item[data-section]').forEach(item => {
        item.classList.remove('active');
        const target = item.getAttribute('data-target') || item.getAttribute('data-section');
        if (target === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Update bottom nav
    document.querySelectorAll('.bottom-nav-item[data-target], .bottom-nav-item[data-section]').forEach(item => {
        item.classList.remove('active');
        const target = item.getAttribute('data-target') || item.getAttribute('data-section');
        if (target === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Update page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('[FocusFlow] Section activated:', sectionId);
    } else {
        console.warn('[FocusFlow] Section not found:', sectionId);
    }
    
    // Close mobile sidebar - support both .open and .active classes
    const sidebar = document.querySelector('.app-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
        sidebar.classList.remove('open');
        sidebar.classList.remove('active');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // Update current section
    appState.currentSection = sectionId;
    
    // Refresh data for specific sections
    if (sectionId === 'dashboard') renderDashboard();
    if (sectionId === 'tasks') renderTasks();
    if (sectionId === 'calendar') renderCalendar();
    if (sectionId === 'insights') renderInsights();
    if (sectionId === 'habits') renderHabits();
    if (sectionId === 'goals') renderGoals();
    if (sectionId === 'notes') renderNotes();
    if (sectionId === 'achievements') renderAchievements();
    if (sectionId === 'pomodoro') {
        initPomodoro();
        updatePomodoroDisplay();
    }
    if (sectionId === 'profile') {
        loadUserInfo();
        applySettings();
    }
}

function toggleMobileMenu() {
    console.log('[FocusFlow] toggleMobileMenu called');
    const sidebar = document.querySelector('.app-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        // Toggle both classes for compatibility
        sidebar.classList.toggle('open');
        sidebar.classList.toggle('active');
    }
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

// ========================================
// MODALS
// ========================================
function initModals() {
    // Close modals on overlay click
    document.querySelectorAll('.app-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.app-modal-overlay.active').forEach(overlay => {
                overlay.classList.remove('active');
            });
        }
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ========================================
// DASHBOARD
// ========================================
function renderDashboard() {
    // Today's Tasks Count
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = appState.tasks.filter(task => {
        const taskDate = task.date ? task.date.split('T')[0] : null;
        return taskDate === today;
    });
    document.getElementById('todayTasksCount').textContent = todayTasks.length;
    
    // Focus Minutes
    const pomodoroData = JSON.parse(localStorage.getItem(STORAGE_KEYS.POMODORO) || '{"totalMinutes":0}');
    document.getElementById('focusMinutes').textContent = pomodoroData.totalMinutes || 0;
    
    // Current Streak
    checkAndUpdateStreak();
    document.getElementById('currentStreak').textContent = appState.streak.current;
    
    // Update streak fire animation
    if (appState.streak.current > 0) {
        const streakFire = document.querySelector('.streak-fire');
        if (streakFire) {
            streakFire.style.animation = 'pulse 1.5s infinite';
        }
    }
    
    // Recent Tasks
    renderRecentTasks();
    
    // Update task badge
    updateTaskBadge();
}

function renderRecentTasks() {
    const container = document.getElementById('recentTasks');
    const recentTasks = appState.tasks.slice(0, 5);
    
    if (recentTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-clipboard-list"></i></div>
                <div class="empty-state-title">No tasks yet</div>
                <div class="empty-state-description">Create your first task to get started!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskComplete('${task.id}')">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-meta-item">
                        <span class="task-priority ${task.priority}"></span>
                        ${task.priority}
                    </span>
                    ${task.category ? `<span class="task-category ${task.category}">${task.category}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateTaskBadge() {
    const today = new Date().toISOString().split('T')[0];
    const incompleteTasks = appState.tasks.filter(task => {
        const taskDate = task.date ? task.date.split('T')[0] : null;
        return taskDate === today && !task.completed;
    });
    document.getElementById('taskBadge').textContent = incompleteTasks.length;
}

// ========================================
// TASKS
// ========================================
function renderTasks() {
    const container = document.getElementById('taskList');
    const filter = appState.taskFilter;
    let filteredTasks = [];
    
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
        case 'today':
            filteredTasks = appState.tasks.filter(task => {
                const taskDate = task.date ? task.date.split('T')[0] : null;
                return taskDate === today;
            });
            break;
        case 'upcoming':
            filteredTasks = appState.tasks.filter(task => {
                const taskDate = task.date ? task.date.split('T')[0] : null;
                return taskDate && taskDate > today && !task.completed;
            });
            break;
        case 'completed':
            filteredTasks = appState.tasks.filter(task => task.completed);
            break;
    }
    
    // Sort by date and priority
    filteredTasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-clipboard-list"></i></div>
                <div class="empty-state-title">No tasks found</div>
                <div class="empty-state-description">Add a new task to get started!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskComplete('${task.id}')">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-meta-item">
                        <span class="task-priority ${task.priority}"></span>
                        ${task.priority}
                    </span>
                    ${task.category ? `<span class="task-category ${task.category}">${task.category}</span>` : ''}
                    ${task.date ? `<span class="task-meta-item"><i class="fas fa-calendar"></i> ${formatDate(task.date)}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn" onclick="editTask('${task.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete" onclick="deleteTask('${task.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addTask() {
    const title = document.getElementById('taskInput').value.trim();
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    
    if (!title) {
        showNotification('Please enter a task title', 'warning');
        return;
    }
    
    const task = {
        id: generateId(),
        title: title,
        category: category,
        priority: priority,
        date: dueDate || new Date().toISOString().split('T')[0],
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    appState.tasks.unshift(task);
    saveTasks();
    
    // Clear form
    document.getElementById('taskInput').value = '';
    document.getElementById('taskDueDate').value = '';
    
    renderTasks();
    renderDashboard();
    renderCalendar();
    checkAchievements();
    
    showNotification('Task added successfully!', 'success');
}

function addMobileTask() {
    const title = document.getElementById('mobileTaskInput').value.trim();
    const category = document.getElementById('mobileTaskCategory').value;
    const priority = document.getElementById('mobileTaskPriority').value;
    const dueDate = document.getElementById('mobileTaskDueDate').value;
    
    if (!title) {
        showNotification('Please enter a task title', 'warning');
        return;
    }
    
    const task = {
        id: generateId(),
        title: title,
        category: category,
        priority: priority,
        date: dueDate || new Date().toISOString().split('T')[0],
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    appState.tasks.unshift(task);
    saveTasks();
    
    // Clear and close modal
    document.getElementById('mobileTaskInput').value = '';
    document.getElementById('mobileTaskDueDate').value = '';
    closeMobileTaskModal();
    
    renderTasks();
    renderDashboard();
    renderCalendar();
    checkAchievements();
    
    showNotification('Task added successfully!', 'success');
}

function editTask(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskCategory').value = task.category;
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskDueDate').value = task.date;
    document.getElementById('editTaskId').value = task.id;
    
    openModal('taskModal');
}

function saveEditedTask() {
    const taskId = document.getElementById('editTaskId').value;
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.title = document.getElementById('editTaskTitle').value.trim();
    task.category = document.getElementById('editTaskCategory').value;
    task.priority = document.getElementById('editTaskPriority').value;
    task.date = document.getElementById('editTaskDueDate').value;
    
    if (!task.title) {
        showNotification('Please enter a task title', 'warning');
        return;
    }
    
    saveTasks();
    closeModal('taskModal');
    renderTasks();
    renderDashboard();
    renderCalendar();
    
    showNotification('Task updated successfully!', 'success');
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    renderDashboard();
    renderCalendar();
    
    showNotification('Task deleted!', 'success');
}

function toggleTaskComplete(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.completed = !task.completed;
    
    if (task.completed) {
        // Update streak when task is completed
        updateStreakOnActivity();
    }
    
    saveTasks();
    renderTasks();
    renderDashboard();
    renderCalendar();
    renderGoals();
    checkAchievements();
}

function filterTasks(filter) {
    appState.taskFilter = filter;
    document.getElementById('taskFilter').value = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
    
    renderTasks();
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(appState.tasks));
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ========================================
// POMODORO
// ========================================
function initPomodoro() {
    // Load pomodoro settings
    const settings = appState.settings;
    appState.pomodoro.timeLeft = settings.pomodoroWork * 60;
    appState.pomodoro.isRunning = false;
    appState.pomodoro.isBreak = false;
    appState.pomodoro.session = 1;
    
    updatePomodoroDisplay();
}

function startPomodoro() {
    if (appState.pomodoro.isRunning) return;
    
    appState.pomodoro.isRunning = true;
    
    appState.pomodoro.interval = setInterval(() => {
        appState.pomodoro.timeLeft--;
        updatePomodoroDisplay();
        
        if (appState.pomodoro.timeLeft <= 0) {
            pomodoroComplete();
        }
    }, 1000);
    
    updatePomodoroButtons();
}

function pausePomodoro() {
    if (!appState.pomodoro.isRunning) return;
    
    appState.pomodoro.isRunning = false;
    clearInterval(appState.pomodoro.interval);
    
    updatePomodoroButtons();
}

function resetPomodoro() {
    pausePomodoro();
    
    const settings = appState.settings;
    appState.pomodoro.timeLeft = appState.pomodoro.isBreak 
        ? settings.pomodoroBreak * 60 
        : settings.pomodoroWork * 60;
    
    updatePomodoroDisplay();
    updatePomodoroButtons();
}

function pomodoroComplete() {
    pausePomodoro();
    
    const settings = appState.settings;
    
    // Play sound
    if (settings.soundEnabled) {
        playNotificationSound();
    }
    
    if (!appState.pomodoro.isBreak) {
        // Focus session completed - save to localStorage
        const pomodoroData = JSON.parse(localStorage.getItem(STORAGE_KEYS.POMODORO) || '{"totalSessions":0,"totalMinutes":0,"todaySessions":0,"todayMinutes":0}');
        
        pomodoroData.totalSessions++;
        pomodoroData.totalMinutes += settings.pomodoroWork;
        
        const today = new Date().toISOString().split('T')[0];
        if (pomodoroData.lastDate !== today) {
            pomodoroData.todaySessions = 0;
            pomodoroData.todayMinutes = 0;
            pomodoroData.lastDate = today;
        }
        
        pomodoroData.todaySessions++;
        pomodoroData.todayMinutes += settings.pomodoroWork;
        
        localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify(pomodoroData));
        
        // Update streak
        updateStreakOnActivity();
        
        // Show notification
        showNotification('Great job! ' + settings.pomodoroWork + ' minutes of focus completed!', 'success');
        
        // Check if it's time for a break
        if (appState.pomodoro.session >= 4) {
            // Long break
            appState.pomodoro.isBreak = true;
            appState.pomodoro.timeLeft = settings.pomodoroLongBreak * 60;
            appState.pomodoro.session = 1;
        } else {
            // Short break
            appState.pomodoro.isBreak = true;
            appState.pomodoro.timeLeft = settings.pomodoroBreak * 60;
        }
        
        // Auto-start break if enabled
        if (settings.autoStartBreak) {
            setTimeout(() => startPomodoro(), 1000);
        }
    } else {
        // Break completed
        appState.pomodoro.isBreak = false;
        appState.pomodoro.timeLeft = settings.pomodoroWork * 60;
        
        if (appState.pomodoro.session < 4) {
            appState.pomodoro.session++;
        }
        
        showNotification('Break is over! Time to focus!', 'info');
    }
    
    // Update displays
    updatePomodoroDisplay();
    updatePomodoroSessionDisplay();
    updatePomodoroButtons();
    renderDashboard();
    renderInsights();
    renderGoals();
    checkAchievements();
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(appState.pomodoro.timeLeft / 60);
    const seconds = appState.pomodoro.timeLeft % 60;
    const timeStr = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    
    // Update all timer displays
    const timerElements = ['pomodoroTimer', 'pomodoroTimerFull', 'fullscreenTimerDisplay'];
    timerElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = timeStr;
    });
    
    // Update timer display styles
    const timerDisplays = document.querySelectorAll('.timer-display, .fullscreen-timer-display');
    timerDisplays.forEach(el => {
        el.classList.remove('running', 'break');
        if (appState.pomodoro.isRunning) {
            el.classList.add('running');
        }
        if (appState.pomodoro.isBreak) {
            el.classList.add('break');
        }
    });
}

function updatePomodoroButtons() {
    const startBtns = ['pomodoroStart', 'pomodoroStartFull', 'fullscreenPomodoroStart'];
    const pauseBtns = ['pomodoroPause', 'pomodoroPauseFull', 'fullscreenPomodoroPause'];
    
    startBtns.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (appState.pomodoro.isRunning) {
                el.classList.add('hidden');
            } else {
                el.classList.remove('hidden');
            }
        }
    });
    
    pauseBtns.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (appState.pomodoro.isRunning) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
}

function updatePomodoroSessionDisplay() {
    const sessionNum = appState.pomodoro.session;
    
    const sessionElements = ['sessionNumber', 'sessionNumberFull', 'fullscreenSessionNumber'];
    sessionElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = sessionNum;
    });
    
    // Update session dots
    const dots = document.querySelectorAll('.session-dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('completed', 'current');
        if (index < sessionNum - 1) {
            dot.classList.add('completed');
        } else if (index === sessionNum - 1) {
            dot.classList.add('current');
        }
    });
}

function playNotificationSound() {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function openFullscreenPomodoro() {
    document.getElementById('fullscreenPomodoro').classList.add('active');
}

function closeFullscreenPomodoro() {
    document.getElementById('fullscreenPomodoro').classList.remove('active');
}

function openAddTaskModal() {
    openModal('mobileAddTaskModal');
}

function closeMobileTaskModal() {
    closeModal('mobileAddTaskModal');
}

// ========================================
// CALENDAR
// ========================================
function renderCalendar() {
    const date = appState.calendarDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarMonth').textContent = monthNames[month] + ' ' + year;
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Generate calendar HTML
    let html = '';
    
    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        html += '<div class="calendar-day-header">' + day + '</div>';
    });
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        html += '<div class="calendar-day other-month">' + day + '</div>';
    }
    
    // Current month days
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        
        // Count tasks for this day
        const dayTasks = appState.tasks.filter(t => {
            const taskDate = t.date ? t.date.split('T')[0] : null;
            return taskDate === dateStr;
        });
        
        const isToday = dateStr === todayStr;
        const isSelected = appState.selectedDate === dateStr;
        const hasTasks = dayTasks.length > 0;
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        if (hasTasks) classes += ' has-tasks';
        
        html += '<div class="' + classes + '" onclick="selectCalendarDate(\'' + dateStr + '\')">' + day;
        if (hasTasks) html += '<span class="calendar-task-count">' + dayTasks.length + '</span>';
        html += '</div>';
    }
    
    // Next month days
    const totalCells = firstDay + totalDays;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        html += '<div class="calendar-day other-month">' + day + '</div>';
    }
    
    document.getElementById('calendarGrid').innerHTML = html;
    
    // Show tasks for selected date
    if (appState.selectedDate) {
        renderCalendarTasks(appState.selectedDate);
    } else {
        renderCalendarTasks(todayStr);
    }
}

function selectCalendarDate(dateStr) {
    appState.selectedDate = dateStr;
    renderCalendar();
}

function renderCalendarTasks(dateStr) {
    const container = document.getElementById('calendarTasks');
    const tasks = appState.tasks.filter(t => {
        const taskDate = t.date ? t.date.split('T')[0] : null;
        return taskDate === dateStr;
    });
    
    const displayDate = new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    
    if (tasks.length === 0) {
        container.innerHTML = '<h3 class="calendar-tasks-title">Tasks for ' + displayDate + '</h3><p class="text-muted">No tasks for this day</p>';
        return;
    }
    
    let html = '<h3 class="calendar-tasks-title">Tasks for ' + displayDate + '</h3><div class="task-list">';
    html += tasks.map(task => {
        return '<div class="task-item ' + (task.completed ? 'completed' : '') + '">' +
            '<div class="task-checkbox ' + (task.completed ? 'checked' : '') + '" onclick="toggleTaskComplete(\'' + task.id + '\')">' +
            (task.completed ? '<i class="fas fa-check"></i>' : '') + '</div>' +
            '<div class="task-content"><div class="task-title">' + escapeHtml(task.title) + '</div>' +
            '<div class="task-meta"><span class="task-priority ' + task.priority + '"></span> ' + task.priority + '</div></div></div>';
    }).join('');
    html += '</div>';
    container.innerHTML = html;
}

function prevMonth() {
    appState.calendarDate.setMonth(appState.calendarDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    appState.calendarDate.setMonth(appState.calendarDate.getMonth() + 1);
    renderCalendar();
}

// ========================================
// HABITS
// ========================================
function renderHabits() {
    const container = document.getElementById('habitsList');
    
    if (appState.habits.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-check-double"></i></div><div class="empty-state-title">No habits yet</div><div class="empty-state-description">Add your first habit to start tracking!</div></div>';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    container.innerHTML = appState.habits.map(habit => {
        const todayCompleted = habit.completedDates && habit.completedDates.includes(today);
        
        return '<div class="habit-item">' +
            '<div class="habit-checkbox ' + (todayCompleted ? 'completed' : '') + '" onclick="toggleHabit(\'' + habit.id + '\')">' +
            (todayCompleted ? '<i class="fas fa-check"></i>' : '') + '</div>' +
            '<div class="habit-info"><div class="habit-name">' + escapeHtml(habit.name) + '</div>' +
            '<div class="habit-streak">🔥 ' + (habit.streak || 0) + ' day streak</div></div>' +
            '<div class="habit-actions">' +
            '<button class="habit-action-btn yes ' + (todayCompleted ? 'active' : '') + '" onclick="toggleHabit(\'' + habit.id + '\')">YES</button>' +
            '<button class="habit-action-btn no" onclick="resetHabitStreak(\'' + habit.id + '\')">NO</button>' +
            '</div></div>';
    }).join('');
}

function addHabit() {
    const input = document.getElementById('habitInput');
    const name = input.value.trim();
    
    if (!name) {
        showNotification('Please enter a habit name', 'warning');
        return;
    }
    
    const habit = {
        id: generateId(),
        name: name,
        streak: 0,
        completedDates: [],
        createdAt: new Date().toISOString()
    };
    
    appState.habits.push(habit);
    saveHabits();
    
    input.value = '';
    renderHabits();
    
    showNotification('Habit added successfully!', 'success');
}

function toggleHabit(habitId) {
    const habit = appState.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (!habit.completedDates) {
        habit.completedDates = [];
    }
    
    if (habit.completedDates.includes(today)) {
        // Already completed today - uncheck
        habit.completedDates = habit.completedDates.filter(d => d !== today);
        habit.streak = Math.max(0, (habit.streak || 1) - 1);
    } else {
        // Check for consecutive days
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (habit.completedDates.includes(yesterdayStr)) {
            // Consecutive day - increase streak
            habit.streak = (habit.streak || 0) + 1;
        } else if (habit.completedDates.length === 0) {
            // First time completing
            habit.streak = 1;
        } else {
            // Streak broken - start new
            habit.streak = 1;
        }
        
        habit.completedDates.push(today);
        
        // Update global streak
        updateStreakOnActivity();
    }
    
    saveHabits();
    renderHabits();
    checkAchievements();
}

function resetHabitStreak(habitId) {
    const habit = appState.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    habit.streak = 0;
    saveHabits();
    renderHabits();
    
    showNotification('Streak reset!', 'info');
}

function saveHabits() {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(appState.habits));
}

// ========================================
// GOALS
// ========================================
function renderGoals() {
    renderDailyGoals();
    renderWeeklyGoals();
}

function renderDailyGoals() {
    const container = document.getElementById('dailyGoals');
    const goals = appState.goals.daily || [];
    
    if (goals.length === 0) {
        container.innerHTML = '<p class="text-muted">No daily goals yet</p>';
        return;
    }
    
    container.innerHTML = goals.map(goal => {
        const progress = calculateDailyGoalProgress(goal);
        const progressPercent = Math.min(100, (progress / goal.target) * 100);
        
        return '<div class="goal-item"><div class="goal-header"><span class="goal-name">' + escapeHtml(goal.title) + '</span><span class="goal-progress-text">' + progress + '/' + goal.target + '</span></div><div class="goal-progress-bar"><div class="goal-progress-fill" style="width:' + progressPercent + '%"></div></div></div>';
    }).join('');
}

function renderWeeklyGoals() {
    const container = document.getElementById('weeklyGoals');
    const goals = appState.goals.weekly || [];
    
    if (goals.length === 0) {
        container.innerHTML = '<p class="text-muted">No weekly goals yet</p>';
        return;
    }
    
    container.innerHTML = goals.map(goal => {
        const progress = calculateWeeklyGoalProgress(goal);
        const progressPercent = Math.min(100, (progress / goal.target) * 100);
        
        return '<div class="goal-item"><div class="goal-header"><span class="goal-name">' + escapeHtml(goal.title) + '</span><span class="goal-progress-text">' + progress + '/' + goal.target + '</span></div><div class="goal-progress-bar"><div class="goal-progress-fill" style="width:' + progressPercent + '%"></div></div></div>';
    }).join('');
}

function calculateDailyGoalProgress(goal) {
    const today = new Date().toISOString().split('T')[0];
    
    switch (goal.type) {
        case 'tasks':
            return appState.tasks.filter(t => {
                const taskDate = t.date ? t.date.split('T')[0] : null;
                return taskDate === today && t.completed;
            }).length;
        case 'pomodoro':
            const pomodoroData = JSON.parse(localStorage.getItem(STORAGE_KEYS.POMODORO) || '{"todayMinutes":0}');
            return Math.floor((pomodoroData.todayMinutes || 0) / 25);
        default:
            return 0;
    }
}

function calculateWeeklyGoalProgress(goal) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    switch (goal.type) {
        case 'tasks':
            return appState.tasks.filter(t => {
                const taskDate = t.date ? t.date.split('T')[0] : null;
                return taskDate && taskDate >= weekStartStr && t.completed;
            }).length;
        case 'pomodoro':
            const pomodoroData = JSON.parse(localStorage.getItem(STORAGE_KEYS.POMODORO) || '{"totalMinutes":0}');
            return Math.floor((pomodoroData.totalMinutes || 0) / 25);
        default:
            return 0;
    }
}

function addGoal(type) {
    const input = document.getElementById(type === 'daily' ? 'dailyGoalInput' : 'weeklyGoalInput');
    const targetInput = document.getElementById(type === 'daily' ? 'dailyGoalTarget' : 'weeklyGoalTarget');
    
    const title = input.value.trim();
    const target = parseInt(targetInput.value) || 1;
    
    if (!title) {
        showNotification('Please enter a goal title', 'warning');
        return;
    }
    
    // Determine goal type based on input
    let goalType = 'tasks';
    const titleLower = title.toLowerCase();
    if (titleLower.includes('pomodoro') || titleLower.includes('focus') || titleLower.includes('session')) {
        goalType = 'pomodoro';
    }
    
    const goal = {
        id: generateId(),
        title: title,
        target: target,
        type: goalType,
        createdAt: new Date().toISOString()
    };
    
    if (type === 'daily') {
        if (!appState.goals.daily) appState.goals.daily = [];
        appState.goals.daily.push(goal);
    } else {
        if (!appState.goals.weekly) appState.goals.weekly = [];
        appState.goals.weekly.push(goal);
    }
    
    saveGoals();
    
    input.value = '';
    targetInput.value = '1';
    
    renderGoals();
    
    showNotification('Goal added successfully!', 'success');
}

function saveGoals() {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(appState.goals));
}

// ========================================
// NOTES
// ========================================
function renderNotes() {
    const container = document.getElementById('notesGrid');
    
    if (appState.notes.length === 0) {
        container.innerHTML = '<div class="add-note-card" onclick="openNoteEditor()"><i class="fas fa-plus"></i><span>Add Note</span></div>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedNotes = [...appState.notes].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    let html = '<div class="add-note-card" onclick="openNoteEditor()"><i class="fas fa-plus"></i><span>Add Note</span></div>';
    html += sortedNotes.map(note => {
        return '<div class="note-card" onclick="editNote(\'' + note.id + '\')">' +
            '<div class="note-title">' + escapeHtml(note.title || 'Untitled') + '</div>' +
            '<div class="note-preview">' + escapeHtml(note.content || 'No content') + '</div>' +
            '<div class="note-date">' + formatDate(note.createdAt) + '</div></div>';
    }).join('');
    
    container.innerHTML = html;
}

function openNoteEditor(noteId) {
    if (noteId) {
        const note = appState.notes.find(n => n.id === noteId);
        if (!note) return;
        
        document.getElementById('noteEditorTitle').value = note.title;
        document.getElementById('noteEditorContent').value = note.content;
        document.getElementById('noteEditorId').value = note.id;
        document.getElementById('deleteNoteBtn').style.display = 'block';
    } else {
        document.getElementById('noteEditorTitle').value = '';
        document.getElementById('noteEditorContent').value = '';
        document.getElementById('noteEditorId').value = '';
        document.getElementById('deleteNoteBtn').style.display = 'none';
    }
    
    openModal('noteEditorModal');
}

function editNote(noteId) {
    openNoteEditor(noteId);
}

function saveNote() {
    const noteId = document.getElementById('noteEditorId').value;
    const title = document.getElementById('noteEditorTitle').value.trim();
    const content = document.getElementById('noteEditorContent').value.trim();
    
    if (!title && !content) {
        showNotification('Please enter a title or content', 'warning');
        return;
    }
    
    if (noteId) {
        // Update existing note
        const note = appState.notes.find(n => n.id === noteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.updatedAt = new Date().toISOString();
        }
    } else {
        // Create new note
        const note = {
            id: generateId(),
            title: title || 'Untitled',
            content: content,
            createdAt: new Date().toISOString()
        };
        appState.notes.push(note);
    }
    
    saveNotes();
    closeModal('noteEditorModal');
    renderNotes();
    
    showNotification('Note saved!', 'success');
}

function deleteNote(noteId) {
    if (!noteId) return;
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    appState.notes = appState.notes.filter(n => n.id !== noteId);
    saveNotes();
    closeModal('noteEditorModal');
    renderNotes();
    
    showNotification('Note deleted!', 'success');
}

function saveNotes() {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(appState.notes));
}

// ========================================
// INSIGHTS
// ========================================
function renderInsights() {
    const pomodoroData = JSON.parse(localStorage.getItem(STORAGE_KEYS.POMODORO) || '{"totalSessions":0,"totalMinutes":0}');
    const completedTasks = appState.tasks.filter(t => t.completed).length;
    
    // Animate numbers
    animateNumber('totalTasksCreated', appState.tasks.length);
    animateNumber('completedTasksCount', completedTasks);
    animateNumber('totalFocusMinutesInsight', pomodoroData.totalMinutes || 0);
    animateNumber('insightCurrentStreak', appState.streak.current);
    
    // Render weekly chart
    renderWeeklyChart();
}

function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const start = 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.add('is-counting');
        }
    }
    
    requestAnimationFrame(update);
}

function renderWeeklyChart() {
    const container = document.getElementById('weeklyChart');
    if (!container) return;
    
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    
    // Get tasks for each day of the week
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const completedCount = appState.tasks.filter(t => {
            const taskDate = t.date ? t.date.split('T')[0] : null;
            return taskDate === dateStr && t.completed;
        }).length;
        
        data.push({
            day: dayNames[date.getDay()],
            value: completedCount
        });
    }
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    container.innerHTML = data.map(d => {
        const height = (d.value / maxValue) * 100;
        return '<div class="chart-bar" style="height:' + Math.max(height, 5) + '%"><span class="chart-bar-value">' + d.value + '</span><span class="chart-bar-label">' + d.day + '</span></div>';
    }).join('');
}

// ========================================
// ACHIEVEMENTS
// ========================================
function renderAchievements() {
    const container = document.getElementById('achievementsList');
    const achievements = [
        {
            id: 'firstTask',
            title: 'First Task',
            description: 'Complete your first task',
            icon: 'fa-check-circle',
            condition: () => appState.tasks.filter(t => t.completed).length >= 1
        },
        {
            id: 'sevenDayStreak',
            title: '7 Day Streak',
            description: 'Maintain a 7-day streak',
            icon: 'fa-fire',
            condition: () => appState.streak.current >= 7
        },
        {
            id: 'tenPomodoros',
            title: 'Focus Master',
            description: 'Complete 10 Pomodoro sessions',
            icon: 'fa-clock',
            condition: () => {
                const pomodoroData = JSON.parse(localStorage.getItem(STORAGE_KEYS.POMODORO) || '{"totalSessions":0}');
                return (pomodoroData.totalSessions || 0) >= 10;
            }
        },
        {
            id: 'fiftyTasks',
            title: 'Task Champion',
            description: 'Complete 50 tasks',
            icon: 'fa-trophy',
            condition: () => appState.tasks.filter(t => t.completed).length >= 50
        }
    ];
    
    container.innerHTML = achievements.map(achievement => {
        const isUnlocked = achievement.condition();
        
        return '<div class="achievement-card ' + (isUnlocked ? 'unlocked' : 'locked') + '">' +
            '<div class="achievement-icon"><i class="fas ' + achievement.icon + '"></i></div>' +
            '<div class="achievement-title">' + achievement.title + '</div>' +
            '<div class="achievement-description">' + achievement.description + '</div>' +
            '<div class="achievement-status">' + (isUnlocked ? 'Unlocked!' : 'Locked') + '</div></div>';
    }).join('');
}

function checkAchievements() {
    const achievements = {
        firstTask: appState.tasks.filter(t => t.completed).length >= 1,
        sevenDayStreak: appState.streak.current >= 7,
        tenPomodoros: (() => {
            const pomodoroData = JSON.parse(localStorage.getItem(STORAGE_KEYS.POMODORO) || '{"totalSessions":0}');
            return (pomodoroData.totalSessions || 0) >= 10;
        })(),
        fiftyTasks: appState.tasks.filter(t => t.completed).length >= 50
    };
    
    // Check for new unlocks
    Object.keys(achievements).forEach(key => {
        if (achievements[key] && !appState.achievements[key]) {
            appState.achievements[key] = true;
            if (!appState.achievements.badges.includes(key)) {
                appState.achievements.badges.push(key);
                showNotification('🏆 Achievement Unlocked: ' + key.replace(/([A-Z])/g, ' $1').trim() + '!', 'success');
            }
        }
    });
    
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(appState.achievements));
    renderAchievements();
}

// ========================================
// STREAK SYSTEM
// ========================================
function checkAndUpdateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = appState.streak.lastActiveDate;
    
    if (!lastActive) {
        // First time - no streak yet
        return;
    }
    
    if (lastActive === today) {
        // Already active today
        return;
    }
    
    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastActive !== yesterdayStr) {
        // Missed a day - reset streak
        appState.streak.current = 0;
        saveStreak();
    }
}

function updateStreakOnActivity() {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = appState.streak.lastActiveDate;
    
    if (lastActive !== today) {
        // Check if coming from yesterday for streak continuity
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActive === yesterdayStr || !lastActive) {
            // Consecutive day - increase streak
            appState.streak.current++;
        } else if (lastActive !== today) {
            // Streak broken - start new
            appState.streak.current = 1;
        }
        
        // Update longest streak
        if (appState.streak.current > appState.streak.longest) {
            appState.streak.longest = appState.streak.current;
        }
        
        appState.streak.lastActiveDate = today;
        saveStreak();
        
        // Check achievements after streak update
        checkAchievements();
    }
}

function saveStreak() {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(appState.streak));
}

// ========================================
// SETTINGS
// ========================================
function saveSettings() {
    const settings = {
        theme: document.getElementById('themeToggle').checked ? 'light' : 'dark',
        accentColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim(),
        pomodoroWork: parseInt(document.getElementById('pomodoroWork').value) || 25,
        pomodoroBreak: parseInt(document.getElementById('pomodoroBreak').value) || 5,
        pomodoroLongBreak: parseInt(document.getElementById('pomodoroLongBreak').value) || 15,
        autoStartBreak: document.getElementById('autoStartBreak').checked,
        soundEnabled: document.getElementById('soundEnabled').checked
    };
    
    appState.settings = settings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    
    // Apply theme
    if (settings.theme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }
    
    showNotification('Settings saved!', 'success');
}

function setAccentColor(color) {
    document.documentElement.style.setProperty('--accent-primary', color);
    
    // Update color options UI
    document.querySelectorAll('.color-option').forEach(el => {
        el.classList.remove('selected');
        if (el.getAttribute('data-color') === color) {
            el.classList.add('selected');
        }
    });
    
    // Save setting
    appState.settings.accentColor = color;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appState.settings));
}

function clearAllData() {
    if (!confirm('Are you sure you want to delete ALL data? This action cannot be undone!')) {
        return;
    }
    
    // Clear all localStorage data except login status and user info
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.POMODORO);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    
    // Reinitialize empty data
    initializeData();
    
    // Reload all data and re-render
    loadAllData();
    renderDashboard();
    renderTasks();
    renderHabits();
    renderGoals();
    renderNotes();
    renderInsights();
    renderAchievements();
    renderCalendar();
    
    showNotification('All data has been cleared!', 'success');
}

function resetStreakData() {
    if (!confirm('Are you sure you want to reset your streak? This cannot be undone!')) {
        return;
    }
    
    // Reset streak data
    appState.streak = {
        current: 0,
        longest: 0,
        lastActiveDate: null
    };
    saveStreak();
    
    // Update UI
    renderDashboard();
    renderInsights();
    
    showNotification('Streak has been reset!', 'success');
}

// ========================================
// UTILITIES
// ========================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type) {
    type = type || 'info';
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    else if (type === 'error') icon = 'times-circle';
    else if (type === 'warning') icon = 'exclamation-circle';
    
    notification.innerHTML = '<i class="fas fa-' + icon + '"></i><span>' + message + '</span>';
    
    container.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    localStorage.removeItem(STORAGE_KEYS.LOGGED_IN);
    window.location.href = 'login.html';
}

// ========================================
// GLOBAL ERROR HANDLING
// ========================================
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
    return false;
};

window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', event.reason);
};
