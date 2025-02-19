// Calendar activities data
const activities2024 = {
    'January': [
        { 
            type: 'Internal Safety Audit', 
            group: 'Group 1 PRC',
            status: 'completed',
            date: '2024-01-15'
        },
        { 
            type: '4RKY Presentation', 
            group: 'Group 4 NJL',
            status: 'completed',
            date: '2024-01-20'
        }
    ],
    'February': [
        {
            type: 'Safety Cross Audit with VSLC',
            group: 'THPAL-VSLC',
            status: 'pending',
            date: '2024-02-15'
        }
    ],
    // Add more months...
};

const activities2025 = {
    'January': [
        {
            type: 'Safety Cross Audit with VSLC',
            group: 'THPAL-VSLC',
            status: 'pending',
            date: '2025-01-15'
        }
    ],
    // Add more months...
};

// Helper Functions
function getStatusBadge(status, date) {
    const activityDate = new Date(date);
    const today = new Date();
    
    if (status === 'completed') {
        return '<span class="activity-status status-completed">Completed</span>';
    }
    
    if (activityDate < today && status !== 'completed') {
        return '<span class="activity-status status-pending">Pending</span>';
    }
    
    if (activityDate.toDateString() === today.toDateString()) {
        return '<span class="activity-status status-in-progress">Today</span>';
    }
    
    return '<span class="activity-status status-pending">Upcoming</span>';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function getGroupClass(group) {
    if (group.includes('Group 1')) return 'group-1';
    if (group.includes('Group 2')) return 'group-2';
    if (group.includes('Group 3')) return 'group-3';
    if (group.includes('Group 4')) return 'group-4';
    if (group.includes('All Groups')) return 'group-all';
    return '';
}

// Add this new function to scroll to current month
function scrollToCurrentMonth() {
    const currentMonthCard = document.querySelector('.month-card.current-month');
    if (currentMonthCard) {
        currentMonthCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Add this function to get available years from activities
function getAvailableYears() {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1]; // Previous, current, and next year
    return years;
}

// Update the calendar creation function
function createYearFilter() {
    const yearSelector = document.querySelector('.year-selector');
    yearSelector.innerHTML = ''; // Clear existing buttons
    
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.setAttribute('role', 'group');
    btnGroup.setAttribute('aria-label', 'Year selection');

    const years = getAvailableYears();
    const currentYear = new Date().getFullYear().toString();

    years.forEach(year => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn btn-outline-primary year-btn${year.toString() === currentYear ? ' active' : ''}`;
        button.dataset.year = year.toString();
        button.textContent = year.toString();
        
        button.addEventListener('click', function() {
            document.querySelectorAll('.year-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            createCalendar(this.dataset.year);
            scrollToCurrentMonth();
        });
        
        btnGroup.appendChild(button);
    });

    yearSelector.appendChild(btnGroup);
}

// Update the initialization code
document.addEventListener('DOMContentLoaded', function() {
    // Create year filter buttons
    createYearFilter();
    
    // Initialize calendar with current year
    const currentYear = new Date().getFullYear().toString();
    createCalendar(currentYear);
    
    // Scroll to current month
    setTimeout(scrollToCurrentMonth, 100); // Small delay to ensure rendering is complete
});

// Update the createCalendar function to highlight current month more prominently
function createCalendar(year) {
    const calendarGrid = document.querySelector('.calendar-grid');
    calendarGrid.innerHTML = '';
    
    const activities = year === '2024' ? activities2024 : activities2025;
    const months = ['January', 'February', 'March', 'April', 
                   'May', 'June', 'July', 'August',
                   'September', 'October', 'November', 'December'];
    
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear().toString();

    // Create a container for better scrolling
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendar-container';

    months.forEach(month => {
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        
        const isCurrentMonth = month === currentMonth && year === currentYear;
        if (isCurrentMonth) {
            monthCard.classList.add('current-month');
        }
        
        const monthActivities = activities[month] || [];
        
        monthCard.innerHTML = `
            <div class="month-header">${month}</div>
            <div class="activities">
                ${monthActivities.length > 0 ? 
                    monthActivities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-type">${activity.type}</div>
                                <div class="activity-info">
                                    <span class="activity-date">${formatDate(activity.date)}</span>
                                    <span class="activity-group ${getGroupClass(activity.group)}">${activity.group}</span>
                                </div>
                            </div>
                            ${getStatusBadge(activity.status, activity.date)}
                        </div>
                    `).join('') : 
                    '<div class="empty-month">No scheduled activities</div>'
                }
            </div>
        `;
        
        monthCard.addEventListener('click', () => {
            showMonthDetails(month, monthActivities, year);
        });
        
        calendarGrid.appendChild(monthCard);
    });
}

function showMonthDetails(month, activities, year) {
    const modal = document.getElementById('groupModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    
    modalTitle.textContent = `${month} ${year} Activities`;
    modalBody.innerHTML = activities.length > 0 ? `
        <div class="list-group">
            ${activities.map(activity => `
                <div class="list-group-item">
                    <h6 class="mb-1">${activity.type}</h6>
                    <p class="mb-1">
                        <span class="badge ${getGroupClass(activity.group)}">${activity.group}</span>
                        ${getStatusBadge(activity.status, activity.date)}
                    </p>
                    <small class="text-muted">${formatDate(activity.date)}</small>
                </div>
            `).join('')}
        </div>
    ` : '<p class="text-center text-muted">No scheduled activities for this month</p>';
    
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
} 