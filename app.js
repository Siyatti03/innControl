/* Mock Data for Application State */
const state = {
    rooms: [
        { id: '100', type: 'Suite', rate: 150, status: 'available' },
        { id: '101', type: 'Deluxe', rate: 120, status: 'available' },
        { id: '102', type: 'Standard', rate: 90, status: 'available' },
        { id: '103', type: 'Suite', rate: 150, status: 'available' },
        { id: '104', type: 'Standard', rate: 90, status: 'available' },
        { id: '105', type: 'Standard', rate: 90, status: 'occupied', guest: 'Guest 5' },
        { id: '106', type: 'Suite', rate: 150, status: 'occupied', guest: 'Guest 6' },
        { id: '107', type: 'Deluxe', rate: 120, status: 'occupied', guest: 'Guest 7' },
        { id: '108', type: 'Standard', rate: 90, status: 'occupied', guest: 'Guest 8' },
        { id: '109', type: 'Deluxe', rate: 120, status: 'cleaning' },
        { id: '110', type: 'Standard', rate: 90, status: 'reserved' },
        // Added some more for completeness
        { id: '111', type: 'Suite', rate: 150, status: 'occupied' },
        { id: '112', type: 'Standard', rate: 90, status: 'cleaning' },
        { id: '113', type: 'Standard', rate: 90, status: 'cleaning' },
        { id: '114', type: 'Deluxe', rate: 120, status: 'reserved' },
        { id: '115', type: 'Standard', rate: 90, status: 'reserved' },
        { id: '116', type: 'Standard', rate: 90, status: 'available' },
        { id: '117', type: 'Standard', rate: 90, status: 'occupied' },
        { id: '118', type: 'Suite', rate: 150, status: 'occupied' },
        { id: '119', type: 'Deluxe', rate: 120, status: 'available' },
    ],
    guests: [
        { name: 'Guest 5', room: '105 - Standard', phone: '555-0100', email: 'guest5@email.com', checkIn: 'Apr 20', checkOut: 'Apr 23', nights: 3, status: 'Checked-In', id: 'G5' },
        { name: 'Guest 6', room: '106 - Suite', phone: '555-0101', email: 'guest6@email.com', checkIn: 'Apr 20', checkOut: 'Apr 23', nights: 3, status: 'Checked-In', id: 'G6' },
        { name: 'Guest 7', room: '107 - Deluxe', phone: '555-0102', email: 'guest7@email.com', checkIn: 'Apr 20', checkOut: 'Apr 23', nights: 3, status: 'Checked-In', id: 'G7' },
        { name: 'Guest 8', room: '108 - Standard', phone: '555-0103', email: 'guest8@email.com', checkIn: 'Apr 20', checkOut: 'Apr 23', nights: 3, status: 'Checked-In', id: 'G8' }
    ]
};

/* DOM Elements */
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');

/* Navigation Logic */
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all nav items and sections
        navItems.forEach(nav => nav.classList.remove('active'));
        viewSections.forEach(section => section.classList.remove('active'));
        
        // Add active class to clicked nav and target section
        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

/* Dashboard Logic */
function renderDashboard() {
    const totalRooms = state.rooms.length;
    const available = state.rooms.filter(r => r.status === 'available').length;
    const occupied = state.rooms.filter(r => r.status === 'occupied').length;
    const reserved = state.rooms.filter(r => r.status === 'reserved').length;
    const cleaning = state.rooms.filter(r => r.status === 'cleaning').length;

    // Update Top Stat Cards
    document.getElementById('dash-avail').innerText = available;
    document.getElementById('dash-avail-detail').innerText = `${available} of ${totalRooms} rooms`;
    
    document.getElementById('dash-occ').innerText = occupied;
    const occPerc = Math.round((occupied / totalRooms) * 100);
    document.getElementById('dash-occ-detail').innerText = `${occPerc}% occupancy`;
    
    document.getElementById('dash-res').innerText = reserved;
    document.getElementById('dash-clean').innerText = cleaning;

    // Update Progress Bars
    const statusContainer = document.getElementById('room-status-bars');
    const colorMap = {
        'Available': 'var(--status-available-text)',
        'Occupied': 'var(--status-occupied-text)',
        'Reserved': '#D97706', // warning/amber
        'Cleaning': 'var(--status-cleaning-text)'
    };
    
    statusContainer.innerHTML = '';
    
    const statuses = [
        { label: 'Available', count: available },
        { label: 'Occupied', count: occupied },
        { label: 'Reserved', count: reserved },
        { label: 'Cleaning', count: cleaning }
    ];

    statuses.forEach(s => {
        const perc = (s.count / totalRooms) * 100;
        const html = `
            <div class="progress-item">
                <div class="progress-label">${s.label}</div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${perc}%; background-color: ${colorMap[s.label]}"></div>
                </div>
                <div class="progress-value">${s.count}</div>
            </div>
        `;
        statusContainer.innerHTML += html;
    });
}

/* Room Management Logic */
function renderRooms() {
    const grid = document.getElementById('rooms-grid');
    grid.innerHTML = '';
    
    state.rooms.forEach(room => {
        // Find icon based on status
        let icon = 'hotel_class';
        let statusBadgeClass = `status-${room.status}`;
        
        const cardHtml = `
            <div class="room-card" data-status="${room.status}">
                <div class="room-header">
                    <h3>Room ${room.id}</h3>
                    <span class="room-status-badge ${statusBadgeClass}">
                        <span class="material-symbols-rounded" style="font-size: 14px;">fiber_manual_record</span>
                        ${room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </span>
                </div>
                <p>${room.type}</p>
                <div class="room-rate">Rate: $${room.rate}/night</div>
                
                <div class="room-actions">
                    <button class="btn-block btn-primary-action" onclick="alert('Checking in Room ${room.id}')">Check-In</button>
                    ${room.status === 'available' ? `<button class="btn-block btn-secondary-action" onclick="alert('Reserving Room ${room.id}')">Reserve</button>` : ''}
                    
                    <select class="room-dropdown">
                         <option value="available" ${room.status==='available'?'selected':''}>Available</option>
                         <option value="occupied" ${room.status==='occupied'?'selected':''}>Occupied</option>
                         <option value="reserved" ${room.status==='reserved'?'selected':''}>Reserved</option>
                         <option value="cleaning" ${room.status==='cleaning'?'selected':''}>Cleaning</option>
                    </select>
                </div>
            </div>
        `;
        grid.innerHTML += cardHtml;
    });
}

/* Guests Logic */
function renderGuests() {
    const grid = document.getElementById('guests-grid');
    grid.innerHTML = '';
    
    state.guests.forEach(guest => {
        const cardHtml = `
            <div class="guest-card">
                <div class="guest-profile-header">
                    <div class="guest-info-block">
                        <div class="guest-avatar">${guest.id}</div>
                        <div class="guest-details">
                            <h4>${guest.name}</h4>
                            <p><span class="material-symbols-rounded" style="font-size: 16px;">meeting_room</span> ${guest.room}</p>
                        </div>
                    </div>
                    <span class="pill status-occupied">${guest.status}</span>
                </div>
                
                <div class="guest-contact">
                    <div><span class="material-symbols-rounded">call</span> ${guest.phone}</div>
                    <div style="margin-top:4px"><span class="material-symbols-rounded">mail</span> ${guest.email}</div>
                </div>

                <div class="guest-stay-info">
                    <div class="stay-col">
                        <h5>Check-In</h5>
                        <p>${guest.checkIn}</p>
                    </div>
                    <div class="stay-col">
                        <h5>Check-Out</h5>
                        <p>${guest.checkOut}</p>
                    </div>
                    <div class="stay-col" style="text-align: right">
                        <h5>Nights</h5>
                        <p>${guest.nights}</p>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHtml;
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderRooms();
    renderGuests();
});
