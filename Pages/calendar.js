// Global variables for current month and year.
let today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // 0-indexed: 0 for January

// Replace the monthAbbr array with full month names
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Keep the monthAbbr array for date formatting
const monthAbbr = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Helper to format day numbers as two digits.
function formatDay(day) {
  return day < 10 ? "0" + day : day.toString();
}

// Returns an array of incident objects for a specific day in the current month/year.
function getIncidentsForDay(day) {
  const formattedDate = monthAbbr[currentMonth] + "/" + (day < 10 ? "0" + day : day) + "/" + currentYear;
  return incidents.filter(incident => incident.date === formattedDate);
}

// Helper function to decide if a cell is in the active (geometric) area of the cross.
function isCellActive(r, c, totalCols) {
  // In our 11-column grid:
  // - Columns 0 and 10 are always inactive.
  // - For top (r < 3) and bottom (r > 4) groups: active if column is between 4 and 6 (inclusive).
  // - For middle group (rows 3 and 4): active if column is between 2 and 8 (inclusive).
  if (c === 0 || c === totalCols - 1) return false;
  if (r < 3 || r > 4) {
    return (c >= 4 && c <= 6);
  } else { // rows 3 and 4
    return (c >= 2 && c <= 8);
  }
}

// Helper function to decide if a cell is on the outer edge of the cross
function isOuterEdge(r, c, totalCols) {
  if (!isCellActive(r, c, totalCols)) return false;
  
  // Check if any adjacent cell is inactive OR if we're at the absolute edges
  const adjacentCells = [
    [r-1, c], // top
    [r+1, c], // bottom
    [r, c-1], // left
    [r, c+1]  // right
  ];
  
  return adjacentCells.some(([adjR, adjC]) => {
    // Consider cells at the very top (r=0) and bottom (r=7) as edge cells
    if (r === 0 || r === 7) return true;
    return adjR < 0 || adjR >= 8 || adjC < 0 || adjC >= totalCols || !isCellActive(adjR, adjC, totalCols);
  });
}

// Render the cross-shaped monthly calendar with an 11-column grid,
// drawing an enhanced (thick) outer border around the entire calendar days region,
// even for an active cell that ended up blank because the month ran out.
function renderCalendar() {
  const calendarDiv = document.getElementById("calendar");
  calendarDiv.innerHTML = ""; // Clear previous content
  
  // Update the month/year title in the header
  const monthYearTitle = document.getElementById("monthYearTitle");
  monthYearTitle.textContent = monthNames[currentMonth] + " " + currentYear;
  
  // Calculate the number of days in the month.
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Create the table.
  const table = document.createElement("table");
  table.className = "table table-bordered";
  
  const totalRows = 8;
  const totalCols = 11; // 11-column grid
  
  // Build two maps:
  // fillDayMap: for active cells, assign day numbers sequentially until daysInMonth is reached;
  // seqMap: for every active cell, record its sequential order.
  let fillDayMap = []; // 2D array: 0 meaning unfilled.
  let seqMap = [];     // 2D array: 0 means not active.
  let seqCounter = 1;
  let dayCounter = 1;
  
  for (let r = 0; r < totalRows; r++) {
    fillDayMap[r] = [];
    seqMap[r] = [];
    for (let c = 0; c < totalCols; c++) {
      if (isCellActive(r, c, totalCols)) {
        seqMap[r][c] = seqCounter;
        seqCounter++;
        if (dayCounter <= daysInMonth) {
          fillDayMap[r][c] = dayCounter;
          dayCounter++;
        } else {
          fillDayMap[r][c] = 0;
        }
      } else {
        seqMap[r][c] = 0;
        fillDayMap[r][c] = 0;
      }
    }
  }
  
  // Render table rows and cells using seqMap and fillDayMap.
  for (let r = 0; r < totalRows; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < totalCols; c++) {
      const td = document.createElement("td");
      if (isCellActive(r, c, totalCols)) {
        td.classList.add("cross-cell");
        let cellSeq = seqMap[r][c];
        let day = fillDayMap[r][c];
        
        // Remove internal borders by default
        td.style.border = "none";
        
        // Add borders only if it's an outer edge
        if (isOuterEdge(r, c, totalCols)) {
          // Top border - explicitly check first row
          if (r === 0 || !isCellActive(r-1, c, totalCols)) {
            td.classList.add("border-top-enhance");
          }
          // Bottom border - explicitly check last row
          if (r === 7 || !isCellActive(r+1, c, totalCols)) {
            td.classList.add("border-bottom-enhance");
          }
          // Left border
          if (!isCellActive(r, c-1, totalCols)) {
            td.classList.add("border-left-enhance");
          }
          // Right border
          if (!isCellActive(r, c+1, totalCols)) {
            td.classList.add("border-right-enhance");
          }
        }
        
        // Handle empty cells based on their sequence and current month/year
        if (day === 0) {
          if (currentYear < today.getFullYear() || 
              (currentYear === today.getFullYear() && currentMonth < today.getMonth())) {
            // Past months should be all green
            td.classList.add("past");
          } else if (currentYear > today.getFullYear() || 
                    (currentYear === today.getFullYear() && currentMonth > today.getMonth())) {
            // Future months should be all white
            td.classList.add("future");
          } else {
            // Current month: check sequence
            if (cellSeq < seqMap[0][4]) {
              td.classList.add("past");
            } else {
              td.classList.add("future");
            }
          }
        } else {
          // Existing logic for cells with day numbers
          td.textContent = day;
          
          // Add tooltip showing the date
          td.title = `${monthNames[currentMonth]} ${day}, ${currentYear}`;
          
          // Add data count badge for cells with incidents
          const incidentCount = getIncidentsForDay(day).length;
          if (incidentCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
            badge.style.fontSize = '12px';
            badge.style.transform = 'translate(-50%, -50%)';
            badge.textContent = incidentCount;
            td.style.position = 'relative';
            td.appendChild(badge);
          }
          
          // Add hover effect listeners
          td.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
          });
          
          td.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
          });
          
          // Determine state: past, today, or future.
          let stateClass = "";
          if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
            if (day === today.getDate()) {
              stateClass = "today";
            } else if (day < today.getDate()) {
              stateClass = "past";
            } else {
              stateClass = "future";
            }
          } else if (currentYear < today.getFullYear() ||
                    (currentYear === today.getFullYear() && currentMonth < today.getMonth())) {
            stateClass = "past";
          } else {
            stateClass = "future";
          }
          td.classList.add(stateClass);
          
          // Mark the cell if incident data exists.
          if (getIncidentsForDay(day).length > 0) {
            td.classList.add("has-data");
          }
        }
        
        // Attach click event only for cells that actually have a day.
        if (day > 0) {
          (function(dayCopy) {
            td.onclick = function() {
              showDayDetails(dayCopy);
            };
          })(day);
        }
        
      } else {
        // Inactive cell.
        td.classList.add("inactive-cell");
        td.style.cursor = "default";
        td.style.border = "none"; // Remove borders from inactive cells
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  
  calendarDiv.appendChild(table);
  
  updateMonthlySummary();
}

// Enhanced showDayDetails function with animation
function showDayDetails(day) {
  const dayIncidents = getIncidentsForDay(day);
  let details = `<h3 class="text-center">${monthNames[currentMonth]} ${day}, ${currentYear}</h3>`;

  if (dayIncidents.length > 0) {
    details += `<div class="list-group">`;
    dayIncidents.forEach(incident => {
      details += `
        <div class="list-group-item list-group-item-action animate__animated animate__fadeIn">
          <div class="d-flex justify-content-between">
            <h5 class="mb-1">Incident #${incident.no}</h5>
            <small class="text-muted">${incident.status}</small>
          </div>
          <p class="mb-1">${incident.title}</p>
        </div>`;
    });
    details += `</div>`;
  } else {
    details = `
      <div class="text-center p-4">
        <i class="bi bi-calendar-check" style="font-size: 2rem;"></i>
        <p class="mt-3">No incidents reported on this day</p>
      </div>`;
  }
  
  document.getElementById("incidentModalBody").innerHTML = details;
  
  const incidentModal = new bootstrap.Modal(document.getElementById("incidentModal"));
  incidentModal.show();
}

// Add smooth transitions for month navigation
function prevMonth() {
  const calendar = document.getElementById("calendar");
  calendar.style.opacity = 0;
  setTimeout(() => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
    calendar.style.opacity = 1;
  }, 300);
}

function nextMonth() {
  const calendar = document.getElementById("calendar");
  calendar.style.opacity = 0;
  setTimeout(() => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
    calendar.style.opacity = 1;
  }, 300);
}

function updateMonthlySummary() {
    const incidents = getAllIncidentsForMonth(currentMonth, currentYear);
    const totalIncidents = incidents.length;
    
    // Count incidents by status
    const statusCounts = incidents.reduce((acc, incident) => {
        acc[incident.status] = (acc[incident.status] || 0) + 1;
        return acc;
    }, {});

    // Calculate days with/without incidents
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysWithIncidents = new Set(incidents.map(inc => new Date(inc.date).getDate())).size;
    const safetyPercentage = ((daysInMonth - daysWithIncidents) / daysInMonth * 100).toFixed(1);

    // Create status cards based on all possible statuses
    const statusCards = Object.entries(statusCounts).map(([status, count]) => `
        <div class="col-md-3 mb-2">
            <div class="card ${getStatusCardColor(status)}">
                <div class="card-body text-center">
                    <h3 class="card-title">${count}</h3>
                    <p class="card-text">${status} Incidents</p>
                </div>
            </div>
        </div>
    `).join('');

    const summaryHTML = `
        <div class="col-md-3 mb-2">
            <div class="card bg-primary text-white">
                <div class="card-body text-center">
                    <h3 class="card-title">${totalIncidents}</h3>
                    <p class="card-text">Total Incidents</p>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-2">
            <div class="card bg-success text-white">
                <div class="card-body text-center">
                    <h3 class="card-title">${safetyPercentage}%</h3>
                    <p class="card-text">Safe Days</p>
                </div>
            </div>
        </div>
        ${statusCards}
    `;

    document.getElementById('monthSummary').innerHTML = summaryHTML;
}

// Helper function to determine card color based on status
function getStatusCardColor(status) {
    const colorMap = {
        'Open': 'bg-warning',
        'In Progress': 'bg-info text-white',
        'Closed': 'bg-secondary text-white',
        'Under Review': 'bg-primary text-white',
        'Critical': 'bg-danger text-white'
        // Add more status-color mappings as needed
    };
    return colorMap[status] || 'bg-light';
}

function getAllIncidentsForMonth(month, year) {
    // Filter incidents for the current month and year
    return incidents.filter(incident => {
        const incidentDate = new Date(incident.date);
        return incidentDate.getMonth() === month && incidentDate.getFullYear() === year;
    });
}

// Render calendar when DOM is ready.
document.addEventListener("DOMContentLoaded", function() {
  renderCalendar();
}); 