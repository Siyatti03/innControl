/* =====================================================
   NAVIGATION
   ===================================================== */
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');

navItems.forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active'));
        viewSections.forEach(s => s.classList.remove('active'));
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
        if (target === 'reservations') renderReservations();
        if (target === 'payments') renderPayments();
        if (target === 'guests') renderGuests();
        if (target === 'room-management') renderRooms();
    });
});

/* =====================================================
   DASHBOARD
   ===================================================== */
function renderDashboard() {
    const total = state.rooms.length;
    const counts = { available: 0, occupied: 0, reserved: 0, cleaning: 0 };
    state.rooms.forEach(r => counts[r.status]++);

    document.getElementById('dash-avail').innerText = counts.available;
    document.getElementById('dash-avail-detail').innerText = `${counts.available} of ${total} rooms`;
    document.getElementById('dash-occ').innerText = counts.occupied;
    document.getElementById('dash-occ-detail').innerText = `${Math.round((counts.occupied / total) * 100)}% occupancy`;
    document.getElementById('dash-res').innerText = counts.reserved;
    document.getElementById('dash-clean').innerText = counts.cleaning;

    const today = new Date().toISOString().slice(0, 10);
    const checkinsToday = state.guests.filter(g => g.checkIn === today && g.status === 'checked-in').length;
    const checkoutsToday = state.guests.filter(g => g.checkOut === today && g.status === 'checked-in').length;
    document.getElementById('dash-checkins-today').innerText = checkinsToday;
    document.getElementById('dash-checkouts-today').innerText = checkoutsToday;

    const colorMap = {
        Available: 'var(--status-available-text)',
        Occupied:  'var(--status-occupied-text)',
        Reserved:  '#D97706',
        Cleaning:  'var(--status-cleaning-text)'
    };
    const statusContainer = document.getElementById('room-status-bars');
    statusContainer.innerHTML = '';
    [
        { label: 'Available', count: counts.available },
        { label: 'Occupied',  count: counts.occupied },
        { label: 'Reserved',  count: counts.reserved },
        { label: 'Cleaning',  count: counts.cleaning }
    ].forEach(s => {
        const perc = (s.count / total) * 100;
        statusContainer.innerHTML += `
            <div class="progress-item">
                <div class="progress-label">${s.label}</div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width:${perc}%;background:${colorMap[s.label]}"></div>
                </div>
                <div class="progress-value">${s.count}</div>
            </div>`;
    });
}

/* =====================================================
   ROOM MANAGEMENT
   ===================================================== */
let activeStatusFilters = new Set();
let activeTypeFilters   = new Set();

function renderRooms() {
    const numQuery  = (document.getElementById('filter-room-num')?.value || '').toLowerCase();
    const nameQuery = (document.getElementById('filter-guest-name')?.value || '').toLowerCase();

    let filtered = state.rooms.filter(r => {
        if (numQuery  && !r.id.toLowerCase().includes(numQuery)) return false;
        if (nameQuery) {
            const guest = state.guests.find(g => g.roomId === r.id && g.status === 'checked-in');
            if (!guest || !(guest.firstName + ' ' + guest.lastName).toLowerCase().includes(nameQuery)) return false;
        }
        if (activeStatusFilters.size > 0 && !activeStatusFilters.has(r.status)) return false;
        if (activeTypeFilters.size > 0   && !activeTypeFilters.has(r.type))     return false;
        return true;
    });

    document.getElementById('room-count-subtitle').innerText =
        `Showing ${filtered.length} of ${state.rooms.length} rooms`;

    const grid = document.getElementById('rooms-grid');
    grid.innerHTML = '';
    filtered.forEach(room => {
        const guest = state.guests.find(g => g.roomId === room.id && g.status === 'checked-in');
        const guestName = guest ? `${guest.firstName} ${guest.lastName}` : '';
        const isOccupied = room.status === 'occupied';
        const isAvailable = room.status === 'available';

        grid.innerHTML += `
            <div class="room-card" data-status="${room.status}">
                <div class="room-header">
                    <h3>Room ${room.id}</h3>
                    <span class="room-status-badge status-${room.status}">
                        <span class="material-symbols-rounded" style="font-size:14px">fiber_manual_record</span>
                        ${capitalize(room.status)}
                    </span>
                </div>
                <p>${room.type}</p>
                <div class="room-rate">$${room.rate}/night</div>
                ${guestName ? `<p class="room-guest-name"><span class="material-symbols-rounded" style="font-size:14px">person</span> ${guestName}</p>` : ''}
                <div class="room-actions">
                    ${isAvailable || room.status === 'reserved' ? `<button class="btn-block btn-primary-action" onclick="startWizard('checkin','${room.id}')">Check-In</button>` : ''}
                    ${isOccupied ? `<button class="btn-block btn-danger-action" onclick="startWizard('checkout','${room.id}')">Check-Out</button>` : ''}
                    ${isAvailable ? `<button class="btn-block btn-secondary-action" onclick="startWizard('reservation','${room.id}')">Reserve</button>` : ''}
                    <select class="room-dropdown" onchange="changeRoomStatus('${room.id}', this.value)">
                        <option value="available"  ${room.status==='available' ?'selected':''}>Available</option>
                        <option value="occupied"   ${room.status==='occupied'  ?'selected':''}>Occupied</option>
                        <option value="reserved"   ${room.status==='reserved'  ?'selected':''}>Reserved</option>
                        <option value="cleaning"   ${room.status==='cleaning'  ?'selected':''}>Cleaning</option>
                    </select>
                </div>
            </div>`;
    });
}

function changeRoomStatus(roomId, newStatus) {
    const room = state.rooms.find(r => r.id === roomId);
    if (room) {
        room.status = newStatus;
        saveState();
        renderDashboard();
        renderRooms();
    }
}

function initRoomFilters() {
    document.getElementById('filter-room-num').addEventListener('input', renderRooms);
    document.getElementById('filter-guest-name').addEventListener('input', renderRooms);

    document.querySelectorAll('.pill[data-filter-status]').forEach(pill => {
        pill.addEventListener('click', () => {
            const val = pill.getAttribute('data-filter-status');
            if (activeStatusFilters.has(val)) {
                activeStatusFilters.delete(val);
                pill.classList.remove('pill-active');
            } else {
                activeStatusFilters.add(val);
                pill.classList.add('pill-active');
            }
            renderRooms();
        });
    });

    document.querySelectorAll('.pill[data-filter-type]').forEach(pill => {
        pill.addEventListener('click', () => {
            const val = pill.getAttribute('data-filter-type');
            if (activeTypeFilters.has(val)) {
                activeTypeFilters.delete(val);
                pill.classList.remove('pill-active');
            } else {
                activeTypeFilters.add(val);
                pill.classList.add('pill-active');
            }
            renderRooms();
        });
    });
}

/* =====================================================
   GUESTS
   ===================================================== */
function renderGuests(query = '') {
    const q = query.toLowerCase();
    const checked = state.guests.filter(g => g.status === 'checked-in');
    const checkedOut = state.guests.filter(g => g.status === 'checked-out');

    const filter = g =>
        !q ||
        (g.firstName + ' ' + g.lastName).toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        g.roomId.includes(q);

    const filteredIn  = checked.filter(filter);
    const filteredOut = checkedOut.filter(filter);

    document.getElementById('checked-in-title').innerText = `Currently Checked-In (${filteredIn.length})`;
    document.getElementById('checked-out-title').innerText = `Recently Checked-Out (${filteredOut.length})`;

    renderGuestCards('guests-grid-in',  filteredIn,  'checked-in');
    renderGuestCards('guests-grid-out', filteredOut, 'checked-out');
}

function renderGuestCards(gridId, guests, status) {
    const grid = document.getElementById(gridId);
    if (!guests.length) {
        grid.innerHTML = `<p class="no-results">No guests found.</p>`;
        return;
    }
    grid.innerHTML = '';
    guests.forEach(g => {
        const initials = (g.firstName[0] + g.lastName[0]).toUpperCase();
        const badgeClass = status === 'checked-in' ? 'status-occupied' : 'status-cleaning';
        const badgeText  = status === 'checked-in' ? 'Checked-In' : 'Checked-Out';
        const nights = calcNights(g.checkIn, g.checkOut);
        grid.innerHTML += `
            <div class="guest-card">
                <div class="guest-profile-header">
                    <div class="guest-info-block">
                        <div class="guest-avatar">${initials}</div>
                        <div class="guest-details">
                            <h4>${g.firstName} ${g.lastName}</h4>
                            <p><span class="material-symbols-rounded" style="font-size:16px">meeting_room</span> Room ${g.roomId} &mdash; ${g.roomType}</p>
                        </div>
                    </div>
                    <span class="pill ${badgeClass}">${badgeText}</span>
                </div>
                <div class="guest-contact">
                    <div><span class="material-symbols-rounded">call</span> ${g.phone}</div>
                    <div><span class="material-symbols-rounded">mail</span> ${g.email}</div>
                </div>
                <div class="guest-stay-info">
                    <div class="stay-col"><h5>Check-In</h5><p>${formatDate(g.checkIn)}</p></div>
                    <div class="stay-col"><h5>Check-Out</h5><p>${formatDate(g.checkOut)}</p></div>
                    <div class="stay-col" style="text-align:right"><h5>Nights</h5><p>${nights}</p></div>
                </div>
                ${status === 'checked-in' ? `<button class="btn btn-sm btn-outline" style="margin-top:1rem;width:100%" onclick="startWizard('checkout','${g.roomId}')">Process Check-Out</button>` : ''}
            </div>`;
    });
}

/* =====================================================
   RESERVATIONS
   ===================================================== */
function renderReservations() {
    const container = document.getElementById('reservations-list');
    if (!state.reservations.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><span class="material-symbols-rounded">event_busy</span></div>
                <h3>No upcoming reservations</h3>
                <p>Click "New Reservation" to add one.</p>
            </div>`;
        return;
    }
    container.innerHTML = '';
    state.reservations.forEach(r => {
        const nights = calcNights(r.checkIn, r.checkOut);
        const room = state.rooms.find(rm => rm.id === r.roomId);
        const nightly = room ? room.rate : 0;
        container.innerHTML += `
            <div class="reservation-card">
                <div class="res-header">
                    <div>
                        <h4>${r.firstName} ${r.lastName}</h4>
                        <span class="res-confirmation">${r.confirmationNumber}</span>
                    </div>
                    <span class="pill status-reserved">Confirmed</span>
                </div>
                <div class="res-details">
                    <div class="res-detail-item">
                        <span class="material-symbols-rounded">meeting_room</span>
                        Room ${r.roomId} &mdash; ${r.roomType}
                    </div>
                    <div class="res-detail-item">
                        <span class="material-symbols-rounded">calendar_today</span>
                        ${formatDate(r.checkIn)} &rarr; ${formatDate(r.checkOut)} &nbsp;(${nights} nights)
                    </div>
                    <div class="res-detail-item">
                        <span class="material-symbols-rounded">group</span>
                        ${r.adults} adult${r.adults !== 1 ? 's' : ''}${r.children ? ', ' + r.children + ' child' + (r.children !== 1 ? 'ren' : '') : ''}
                    </div>
                    <div class="res-detail-item">
                        <span class="material-symbols-rounded">call</span>
                        ${r.phone}
                    </div>
                </div>
                ${r.specialRequests ? `<p class="res-requests"><em>Requests: ${r.specialRequests}</em></p>` : ''}
                <div class="res-actions">
                    <button class="btn btn-primary" onclick="startWizard('checkin','${r.roomId}','${r.id}')">
                        <span class="material-symbols-rounded">login</span> Check In Now
                    </button>
                    <button class="btn btn-outline" onclick="cancelReservation('${r.id}')">Cancel</button>
                </div>
            </div>`;
    });
}

function cancelReservation(resId) {
    if (!confirm('Cancel this reservation?')) return;
    const res = state.reservations.find(r => r.id === resId);
    if (res) {
        const room = state.rooms.find(r => r.id === res.roomId);
        if (room && room.status === 'reserved') room.status = 'available';
        state.reservations = state.reservations.filter(r => r.id !== resId);
        saveState();
        renderReservations();
        renderDashboard();
    }
}

/* =====================================================
   PAYMENTS
   ===================================================== */
function renderPayments() {
    const total = state.transactions.reduce((sum, t) => sum + t.amount, 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayRevenue = state.transactions.filter(t => t.date === today).reduce((s, t) => s + t.amount, 0);

    document.getElementById('pay-total-revenue').innerText = `$${total.toLocaleString()}`;
    document.getElementById('pay-today-revenue').innerText = `$${todayRevenue.toLocaleString()}`;
    document.getElementById('pay-transaction-count').innerText = state.transactions.length;

    const list = document.getElementById('transactions-list');
    if (!state.transactions.length) {
        list.innerHTML = `<p class="no-results" style="padding:2rem;text-align:center">No transactions yet.</p>`;
        return;
    }
    list.innerHTML = '';
    [...state.transactions].reverse().forEach(t => {
        list.innerHTML += `
            <div class="transaction-row">
                <div class="tx-info">
                    <strong>${t.guestName}</strong>
                    <span class="tx-sub">Room ${t.roomId} &bull; ${t.type} &bull; ${formatDate(t.date)}</span>
                </div>
                <div class="tx-right">
                    <span class="tx-amount">$${t.amount.toLocaleString()}</span>
                    <span class="pill status-available" style="font-size:0.7rem">${t.status}</span>
                </div>
            </div>`;
    });
}

/* =====================================================
   WIZARD SYSTEM
   ===================================================== */
const wizard = {
    type: null,
    step: 0,
    data: {},
    prefillRoomId: null,
    prefillResId: null
};

function startWizard(type, roomId = null, resId = null) {
    wizard.type = type;
    wizard.step = 0;
    wizard.data = {};
    wizard.prefillRoomId = roomId;
    wizard.prefillResId  = resId;

    // Pre-fill from reservation if launching check-in from reservation
    if (type === 'checkin' && resId) {
        const res = state.reservations.find(r => r.id === resId);
        if (res) {
            wizard.data.firstName      = res.firstName;
            wizard.data.lastName       = res.lastName;
            wizard.data.email          = res.email;
            wizard.data.phone          = res.phone;
            wizard.data.checkIn        = res.checkIn;
            wizard.data.checkOut       = res.checkOut;
            wizard.data.adults         = res.adults;
            wizard.data.children       = res.children;
            wizard.data.specialRequests = res.specialRequests;
            wizard.data.selectedRoom   = res.roomId;
            wizard.prefillResId        = resId;
        }
    }

    document.getElementById('wizard-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderWizardStep();
}

function closeWizard() {
    document.getElementById('wizard-overlay').classList.add('hidden');
    document.body.style.overflow = '';
}

document.getElementById('wizard-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeWizard();
});

function wizardNext() {
    if (!collectWizardStep()) return;
    const steps = getWizardSteps();
    if (wizard.step < steps.length - 1) {
        wizard.step++;
        renderWizardStep();
    }
}

function wizardBack() {
    if (wizard.step > 0) {
        wizard.step--;
        renderWizardStep();
    }
}

function getWizardSteps() {
    if (wizard.type === 'checkin')     return ['Guest Info', 'Stay Details', 'Payment', 'Confirmation'];
    if (wizard.type === 'checkout')    return ['Select Guest', 'Review Bill', 'Payment', 'Receipt'];
    if (wizard.type === 'reservation') return ['Guest Info', 'Room & Dates', 'Confirmation'];
    return [];
}

function getWizardTitle() {
    if (wizard.type === 'checkin')     return 'Check-In Guest';
    if (wizard.type === 'checkout')    return 'Check-Out Guest';
    if (wizard.type === 'reservation') return 'New Reservation';
    return '';
}

function renderWizardStep() {
    const steps = getWizardSteps();
    document.getElementById('wizard-title').innerText = getWizardTitle();

    // Step indicator
    const indicator = document.getElementById('wizard-steps-indicator');
    indicator.innerHTML = steps.map((s, i) => `
        <div class="step-item ${i < wizard.step ? 'done' : i === wizard.step ? 'active' : ''}">
            <div class="step-circle">${i < wizard.step ? '<span class="material-symbols-rounded">check</span>' : i + 1}</div>
            <span class="step-label">${s}</span>
        </div>
        ${i < steps.length - 1 ? '<div class="step-line ' + (i < wizard.step ? 'done' : '') + '"></div>' : ''}
    `).join('');

    // Back button visibility
    const backBtn = document.getElementById('wizard-back-btn');
    const nextBtn = document.getElementById('wizard-next-btn');
    backBtn.style.display = wizard.step === 0 ? 'none' : '';

    // Body
    if (wizard.type === 'checkin')     renderCheckinStep(wizard.step, nextBtn);
    if (wizard.type === 'checkout')    renderCheckoutStep(wizard.step, nextBtn);
    if (wizard.type === 'reservation') renderReservationStep(wizard.step, nextBtn);
}

/* =====================================================
   CHECK-IN WIZARD
   ===================================================== */
function renderCheckinStep(step, nextBtn) {
    const body = document.getElementById('wizard-body');
    const d = wizard.data;

    if (step === 0) {
        nextBtn.innerText = 'Continue';
        body.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Guest Information</h3>
                <div class="form-grid-2">
                    <div class="input-group">
                        <label>First Name <span class="required">*</span></label>
                        <input id="f-firstName" type="text" placeholder="First name" value="${d.firstName || ''}">
                    </div>
                    <div class="input-group">
                        <label>Last Name <span class="required">*</span></label>
                        <input id="f-lastName" type="text" placeholder="Last name" value="${d.lastName || ''}">
                    </div>
                    <div class="input-group">
                        <label>Email Address <span class="required">*</span></label>
                        <input id="f-email" type="email" placeholder="guest@email.com" value="${d.email || ''}">
                    </div>
                    <div class="input-group">
                        <label>Phone Number <span class="required">*</span></label>
                        <input id="f-phone" type="tel" placeholder="555-0100" value="${d.phone || ''}">
                    </div>
                    <div class="input-group">
                        <label>ID Type <span class="required">*</span></label>
                        <select id="f-idType">
                            <option value="">Select ID type</option>
                            ${["Passport","Driver's License","National ID","Military ID"].map(t =>
                                `<option ${d.idType === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label>ID Number <span class="required">*</span></label>
                        <input id="f-idNumber" type="text" placeholder="ID / passport number" value="${d.idNumber || ''}">
                    </div>
                    <div class="input-group">
                        <label>Nationality</label>
                        <input id="f-nationality" type="text" placeholder="Country" value="${d.nationality || ''}">
                    </div>
                    <div class="input-group">
                        <label>Date of Birth</label>
                        <input id="f-dob" type="date" value="${d.dob || ''}">
                    </div>
                </div>
                <div class="input-group" style="margin-top:1rem">
                    <label>Emergency Contact Name</label>
                    <input id="f-emergencyName" type="text" placeholder="Full name" value="${d.emergencyName || ''}">
                </div>
                <div class="input-group" style="margin-top:1rem">
                    <label>Emergency Contact Phone</label>
                    <input id="f-emergencyPhone" type="tel" placeholder="555-0000" value="${d.emergencyPhone || ''}">
                </div>
            </div>`;
    }

    else if (step === 1) {
        nextBtn.innerText = 'Continue';
        const today = new Date().toISOString().slice(0, 10);
        const availableRooms = state.rooms.filter(r => r.status === 'available' || r.id === wizard.prefillRoomId);
        body.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Stay Details</h3>
                <div class="form-grid-2">
                    <div class="input-group">
                        <label>Check-In Date <span class="required">*</span></label>
                        <input id="f-checkIn" type="date" value="${d.checkIn || today}" min="${today}">
                    </div>
                    <div class="input-group">
                        <label>Check-Out Date <span class="required">*</span></label>
                        <input id="f-checkOut" type="date" value="${d.checkOut || ''}" min="${today}">
                    </div>
                    <div class="input-group">
                        <label>Number of Adults <span class="required">*</span></label>
                        <select id="f-adults">
                            ${[1,2,3,4].map(n => `<option ${(d.adults||1) == n ? 'selected' : ''}>${n}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Number of Children</label>
                        <select id="f-children">
                            ${[0,1,2,3,4].map(n => `<option ${(d.children||0) == n ? 'selected' : ''}>${n}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="input-group" style="margin-top:1rem">
                    <label>Select Room <span class="required">*</span></label>
                    <select id="f-room">
                        <option value="">-- Choose a room --</option>
                        ${availableRooms.map(r =>
                            `<option value="${r.id}" ${d.selectedRoom === r.id ? 'selected' : ''}>
                                Room ${r.id} &mdash; ${r.type} &mdash; $${r.rate}/night
                            </option>`).join('')}
                    </select>
                </div>
                <div class="input-group" style="margin-top:1rem">
                    <label>Special Requests</label>
                    <textarea id="f-specialRequests" rows="3" placeholder="E.g. high floor, quiet room, extra pillows...">${d.specialRequests || ''}</textarea>
                </div>
                <div id="stay-summary" class="stay-summary hidden"></div>
            </div>`;

        const updateSummary = () => {
            const ci = document.getElementById('f-checkIn').value;
            const co = document.getElementById('f-checkOut').value;
            const rId = document.getElementById('f-room').value;
            if (ci && co && rId) {
                const room = state.rooms.find(r => r.id === rId);
                const nights = calcNights(ci, co);
                const total = nights * room.rate;
                const el = document.getElementById('stay-summary');
                el.classList.remove('hidden');
                el.innerHTML = `
                    <div class="summary-row"><span>Room ${rId} (${room.type})</span><span>$${room.rate}/night</span></div>
                    <div class="summary-row"><span>Duration</span><span>${nights} night${nights !== 1 ? 's' : ''}</span></div>
                    <div class="summary-row summary-total"><span>Estimated Total</span><span>$${total.toLocaleString()}</span></div>`;
            }
        };
        document.getElementById('f-checkIn').addEventListener('change', updateSummary);
        document.getElementById('f-checkOut').addEventListener('change', updateSummary);
        document.getElementById('f-room').addEventListener('change', updateSummary);
        updateSummary();
    }

    else if (step === 2) {
        nextBtn.innerText = 'Confirm Check-In';
        const room  = state.rooms.find(r => r.id === wizard.data.selectedRoom);
        const nights = calcNights(d.checkIn, d.checkOut);
        const total  = nights * room.rate;
        const tax    = Math.round(total * 0.12);
        const grand  = total + tax;

        body.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Payment Details</h3>
                <div class="bill-summary">
                    <div class="summary-row"><span>Room ${room.id} (${room.type})</span><span>$${room.rate} &times; ${nights} nights</span></div>
                    <div class="summary-row"><span>Subtotal</span><span>$${total.toLocaleString()}</span></div>
                    <div class="summary-row"><span>Tax & Fees (12%)</span><span>$${tax.toLocaleString()}</span></div>
                    <div class="summary-row summary-total"><span>Total Due</span><span>$${grand.toLocaleString()}</span></div>
                </div>
                <div class="input-group" style="margin-top:1.5rem">
                    <label>Payment Method <span class="required">*</span></label>
                    <div class="payment-methods">
                        ${['Credit Card','Debit Card','Cash'].map(m => `
                            <label class="payment-option ${d.paymentMethod === m ? 'selected' : ''}">
                                <input type="radio" name="payMethod" value="${m}" ${d.paymentMethod === m ? 'checked' : ''}>
                                <span class="material-symbols-rounded">${m === 'Cash' ? 'payments' : 'credit_card'}</span>
                                ${m}
                            </label>`).join('')}
                    </div>
                </div>
                <div id="card-fields" style="${d.paymentMethod === 'Cash' ? 'display:none' : ''}">
                    <div class="input-group" style="margin-top:1rem">
                        <label>Cardholder Name</label>
                        <input id="f-cardName" type="text" placeholder="${d.firstName || 'Name'} ${d.lastName || ''}" value="${d.cardName || ''}">
                    </div>
                    <div class="form-grid-2" style="margin-top:1rem">
                        <div class="input-group">
                            <label>Card Number</label>
                            <input id="f-cardNumber" type="text" placeholder="•••• •••• •••• ••••" maxlength="19" value="${d.cardNumber || ''}">
                        </div>
                        <div class="input-group">
                            <label>Expiry / CVV</label>
                            <div style="display:flex;gap:0.5rem">
                                <input id="f-cardExpiry" type="text" placeholder="MM/YY" maxlength="5" style="flex:1" value="${d.cardExpiry || ''}">
                                <input id="f-cardCvv" type="text" placeholder="CVV" maxlength="4" style="width:70px" value="${d.cardCvv || ''}">
                            </div>
                        </div>
                    </div>
                </div>
                <label class="checkbox-label" style="margin-top:1.5rem">
                    <input type="checkbox" id="f-terms" ${d.termsAgreed ? 'checked' : ''}>
                    I agree to the hotel's terms, conditions, and cancellation policy.
                </label>
                <p id="pay-total-display" class="pay-amount-display" style="margin-top:1rem">Amount to charge: <strong>$${grand.toLocaleString()}</strong></p>
            </div>`;

        document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
                radio.parentElement.classList.add('selected');
                document.getElementById('card-fields').style.display =
                    radio.value === 'Cash' ? 'none' : '';
            });
        });

        wizard.data._tax   = tax;
        wizard.data._grand = grand;
    }

    else if (step === 3) {
        nextBtn.innerText = 'Done';
        nextBtn.onclick = closeWizard;
        backBtn.style.display = 'none';
        const d = wizard.data;
        const room = state.rooms.find(r => r.id === d.selectedRoom);
        body.innerHTML = `
            <div class="confirmation-screen">
                <div class="confirm-icon"><span class="material-symbols-rounded">check_circle</span></div>
                <h3>Check-In Successful!</h3>
                <p>Welcome, <strong>${d.firstName} ${d.lastName}</strong>.</p>
                <div class="confirm-details">
                    <div class="confirm-row"><span>Room</span><strong>${d.selectedRoom} &mdash; ${room.type}</strong></div>
                    <div class="confirm-row"><span>Check-In</span><strong>${formatDate(d.checkIn)}</strong></div>
                    <div class="confirm-row"><span>Check-Out</span><strong>${formatDate(d.checkOut)}</strong></div>
                    <div class="confirm-row"><span>Guests</span><strong>${d.adults} adult${d.adults != 1 ? 's' : ''}${d.children > 0 ? ', ' + d.children + ' child' + (d.children != 1 ? 'ren' : '') : ''}</strong></div>
                    <div class="confirm-row"><span>Payment</span><strong>${d.paymentMethod}</strong></div>
                    <div class="confirm-row confirm-total"><span>Total Charged</span><strong>$${d._grand.toLocaleString()}</strong></div>
                </div>
                <p class="confirm-note">Key cards have been issued. Enjoy your stay!</p>
            </div>`;
    }
}

/* =====================================================
   CHECK-OUT WIZARD
   ===================================================== */
function renderCheckoutStep(step, nextBtn) {
    const body = document.getElementById('wizard-body');
    const d = wizard.data;

    if (step === 0) {
        nextBtn.innerText = 'Continue';
        const occupiedRooms = state.guests.filter(g => g.status === 'checked-in');
        const preselect = wizard.prefillRoomId;

        body.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Select Guest to Check Out</h3>
                <div class="input-group">
                    <label>Select Occupied Room <span class="required">*</span></label>
                    <select id="f-checkout-room">
                        <option value="">-- Select room --</option>
                        ${occupiedRooms.map(g => `
                            <option value="${g.roomId}" ${preselect === g.roomId ? 'selected' : ''}>
                                Room ${g.roomId} &mdash; ${g.firstName} ${g.lastName} &mdash; ${g.roomType}
                            </option>`).join('')}
                    </select>
                </div>
                <div id="checkout-guest-preview"></div>
            </div>`;

        const updatePreview = () => {
            const rId = document.getElementById('f-checkout-room').value;
            const g = state.guests.find(g => g.roomId === rId && g.status === 'checked-in');
            const preview = document.getElementById('checkout-guest-preview');
            if (g) {
                const nights = calcNights(g.checkIn, g.checkOut);
                preview.innerHTML = `
                    <div class="guest-preview-card">
                        <div class="preview-row"><span>Guest</span><strong>${g.firstName} ${g.lastName}</strong></div>
                        <div class="preview-row"><span>Contact</span><strong>${g.phone}</strong></div>
                        <div class="preview-row"><span>Check-In</span><strong>${formatDate(g.checkIn)}</strong></div>
                        <div class="preview-row"><span>Scheduled Check-Out</span><strong>${formatDate(g.checkOut)}</strong></div>
                        <div class="preview-row"><span>Nights Stayed</span><strong>${nights}</strong></div>
                    </div>`;
            } else {
                preview.innerHTML = '';
            }
        };
        document.getElementById('f-checkout-room').addEventListener('change', updatePreview);
        if (preselect) updatePreview();
    }

    else if (step === 1) {
        nextBtn.innerText = 'Proceed to Payment';
        const g = state.guests.find(g => g.roomId === d.checkoutRoomId && g.status === 'checked-in');
        const room = state.rooms.find(r => r.id === g.roomId);
        const nights = calcNights(g.checkIn, g.checkOut);
        const subtotal = nights * room.rate;
        const tax = Math.round(subtotal * 0.12);
        const grand = subtotal + tax;

        wizard.data._guest = g;
        wizard.data._subtotal = subtotal;
        wizard.data._tax = tax;
        wizard.data._grand = grand;
        wizard.data._nights = nights;

        body.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Review Bill — ${g.firstName} ${g.lastName}</h3>
                <div class="bill-summary">
                    <div class="summary-row"><span>Room ${room.id} (${room.type})</span><span>$${room.rate}/night</span></div>
                    <div class="summary-row"><span>Nights Stayed</span><span>${nights}</span></div>
                    <div class="summary-row"><span>Room Charges</span><span>$${subtotal.toLocaleString()}</span></div>
                    <div class="summary-row"><span>Tax & Fees (12%)</span><span>$${tax.toLocaleString()}</span></div>
                    <div class="summary-row summary-total"><span>Total Due</span><span>$${grand.toLocaleString()}</span></div>
                </div>
                <p style="margin-top:1rem;color:var(--text-muted);font-size:0.85rem">Original payment method on file: <strong>${g.paymentMethod}</strong></p>
            </div>`;
    }

    else if (step === 2) {
        nextBtn.innerText = 'Complete Check-Out';
        const g = d._guest;
        body.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Confirm Payment</h3>
                <div class="bill-summary">
                    <div class="summary-row summary-total"><span>Total Due</span><span>$${d._grand.toLocaleString()}</span></div>
                </div>
                <div class="input-group" style="margin-top:1.5rem">
                    <label>Payment Method <span class="required">*</span></label>
                    <div class="payment-methods">
                        ${['Credit Card','Debit Card','Cash'].map(m => `
                            <label class="payment-option ${g.paymentMethod === m ? 'selected' : ''}">
                                <input type="radio" name="coPayMethod" value="${m}" ${g.paymentMethod === m ? 'checked' : ''}>
                                <span class="material-symbols-rounded">${m === 'Cash' ? 'payments' : 'credit_card'}</span>
                                ${m}
                            </label>`).join('')}
                    </div>
                </div>
                <label class="checkbox-label" style="margin-top:1.5rem">
                    <input type="checkbox" id="f-co-confirm">
                    Guest has confirmed all charges and signed the checkout form.
                </label>
            </div>`;

        document.querySelectorAll('input[name="coPayMethod"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
                radio.parentElement.classList.add('selected');
            });
        });
    }

    else if (step === 3) {
        nextBtn.innerText = 'Done';
        nextBtn.onclick = closeWizard;
        document.getElementById('wizard-back-btn').style.display = 'none';
        const g = d._guest;
        body.innerHTML = `
            <div class="confirmation-screen">
                <div class="confirm-icon receipt"><span class="material-symbols-rounded">receipt_long</span></div>
                <h3>Check-Out Complete</h3>
                <p>Thank you, <strong>${g.firstName} ${g.lastName}</strong>. Safe travels!</p>
                <div class="confirm-details">
                    <div class="confirm-row"><span>Room</span><strong>${g.roomId} — ${g.roomType}</strong></div>
                    <div class="confirm-row"><span>Stayed</span><strong>${d._nights} night${d._nights !== 1 ? 's' : ''}</strong></div>
                    <div class="confirm-row"><span>Check-In</span><strong>${formatDate(g.checkIn)}</strong></div>
                    <div class="confirm-row"><span>Check-Out</span><strong>${formatDate(new Date().toISOString().slice(0,10))}</strong></div>
                    <div class="confirm-row confirm-total"><span>Total Charged</span><strong>$${d._grand.toLocaleString()}</strong></div>
                </div>
                <p class="confirm-note">Room ${g.roomId} has been marked for cleaning.</p>
            </div>`;
    }
}

/* =====================================================
   RESERVATION WIZARD
   ===================================================== */
function renderReservationStep(step, nextBtn) {
    const body = document.getElementById('wizard-body');
    const d = wizard.data;

    if (step === 0) {
        nextBtn.innerText = 'Continue';
        body.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Guest Information</h3>
                <div class="form-grid-2">
                    <div class="input-group">
                        <label>First Name <span class="required">*</span></label>
                        <input id="f-firstName" type="text" placeholder="First name" value="${d.firstName || ''}">
                    </div>
                    <div class="input-group">
                        <label>Last Name <span class="required">*</span></label>
                        <input id="f-lastName" type="text" placeholder="Last name" value="${d.lastName || ''}">
                    </div>
                    <div class="input-group">
                        <label>Email Address <span class="required">*</span></label>
                        <input id="f-email" type="email" placeholder="guest@email.com" value="${d.email || ''}">
                    </div>
                    <div class="input-group">
                        <label>Phone Number <span class="required">*</span></label>
                        <input id="f-phone" type="tel" placeholder="555-0100" value="${d.phone || ''}">
                    </div>
                </div>
            </div>`;
    }

    else if (step === 1) {
        nextBtn.innerText = 'Confirm Reservation';
        const today = new Date().toISOString().slice(0, 10);
        const availRooms = state.rooms.filter(r => r.status === 'available' || r.id === wizard.prefillRoomId);

        body.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Room & Dates</h3>
                <div class="form-grid-2">
                    <div class="input-group">
                        <label>Check-In Date <span class="required">*</span></label>
                        <input id="f-checkIn" type="date" value="${d.checkIn || today}" min="${today}">
                    </div>
                    <div class="input-group">
                        <label>Check-Out Date <span class="required">*</span></label>
                        <input id="f-checkOut" type="date" value="${d.checkOut || ''}" min="${today}">
                    </div>
                    <div class="input-group">
                        <label>Adults <span class="required">*</span></label>
                        <select id="f-adults">
                            ${[1,2,3,4].map(n => `<option ${(d.adults||1)==n?'selected':''}>${n}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Children</label>
                        <select id="f-children">
                            ${[0,1,2,3,4].map(n => `<option ${(d.children||0)==n?'selected':''}>${n}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="input-group" style="margin-top:1rem">
                    <label>Select Room <span class="required">*</span></label>
                    <select id="f-room">
                        <option value="">-- Choose a room --</option>
                        ${availRooms.map(r => `<option value="${r.id}" ${d.selectedRoom===r.id?'selected':''}>Room ${r.id} — ${r.type} — $${r.rate}/night</option>`).join('')}
                    </select>
                </div>
                <div class="input-group" style="margin-top:1rem">
                    <label>Special Requests</label>
                    <textarea id="f-specialRequests" rows="3" placeholder="Anything we should know?">${d.specialRequests || ''}</textarea>
                </div>
                <div id="stay-summary" class="stay-summary hidden"></div>
            </div>`;

        const updateSummary = () => {
            const ci = document.getElementById('f-checkIn').value;
            const co = document.getElementById('f-checkOut').value;
            const rId = document.getElementById('f-room').value;
            if (ci && co && rId) {
                const room = state.rooms.find(r => r.id === rId);
                const nights = calcNights(ci, co);
                const total  = nights * room.rate;
                const el = document.getElementById('stay-summary');
                el.classList.remove('hidden');
                el.innerHTML = `
                    <div class="summary-row"><span>Room ${rId} (${room.type})</span><span>$${room.rate}/night</span></div>
                    <div class="summary-row"><span>Duration</span><span>${nights} night${nights !== 1 ? 's' : ''}</span></div>
                    <div class="summary-row summary-total"><span>Estimated Total</span><span>$${total.toLocaleString()}</span></div>`;
            }
        };
        document.getElementById('f-checkIn').addEventListener('change', updateSummary);
        document.getElementById('f-checkOut').addEventListener('change', updateSummary);
        document.getElementById('f-room').addEventListener('change', updateSummary);
        updateSummary();
    }

    else if (step === 2) {
        nextBtn.innerText = 'Done';
        nextBtn.onclick = closeWizard;
        document.getElementById('wizard-back-btn').style.display = 'none';
        const confNum = 'INN-' + Math.floor(2000 + Math.random() * 8000);
        const room = state.rooms.find(r => r.id === d.selectedRoom);
        body.innerHTML = `
            <div class="confirmation-screen">
                <div class="confirm-icon"><span class="material-symbols-rounded">event_available</span></div>
                <h3>Reservation Confirmed!</h3>
                <p>Confirmation: <strong>${confNum}</strong></p>
                <div class="confirm-details">
                    <div class="confirm-row"><span>Guest</span><strong>${d.firstName} ${d.lastName}</strong></div>
                    <div class="confirm-row"><span>Room</span><strong>${d.selectedRoom} — ${room.type}</strong></div>
                    <div class="confirm-row"><span>Check-In</span><strong>${formatDate(d.checkIn)}</strong></div>
                    <div class="confirm-row"><span>Check-Out</span><strong>${formatDate(d.checkOut)}</strong></div>
                    <div class="confirm-row"><span>Guests</span><strong>${d.adults} adult${d.adults != 1 ? 's' : ''}${d.children > 0 ? ', ' + d.children + ' child' + (d.children != 1 ? 'ren' : '') : ''}</strong></div>
                </div>
                <p class="confirm-note">A confirmation has been noted. Check the Reservations tab to manage.</p>
            </div>`;
    }
}

/* =====================================================
   WIZARD DATA COLLECTION & VALIDATION
   ===================================================== */
function collectWizardStep() {
    const d = wizard.data;

    if (wizard.type === 'checkin') {
        if (wizard.step === 0) {
            const required = ['firstName','lastName','email','phone','idType','idNumber'];
            if (!collectFields(required)) return false;
            d.nationality    = val('f-nationality');
            d.dob            = val('f-dob');
            d.emergencyName  = val('f-emergencyName');
            d.emergencyPhone = val('f-emergencyPhone');
        }
        else if (wizard.step === 1) {
            d.checkIn  = val('f-checkIn');
            d.checkOut = val('f-checkOut');
            d.selectedRoom = val('f-room');
            d.adults   = val('f-adults');
            d.children = val('f-children');
            d.specialRequests = val('f-specialRequests');
            if (!d.checkIn || !d.checkOut || !d.selectedRoom) {
                showError('Please fill in check-in date, check-out date, and select a room.'); return false;
            }
            if (calcNights(d.checkIn, d.checkOut) < 1) {
                showError('Check-out must be after check-in.'); return false;
            }
        }
        else if (wizard.step === 2) {
            d.paymentMethod = document.querySelector('input[name="payMethod"]:checked')?.value;
            if (!d.paymentMethod) { showError('Please select a payment method.'); return false; }
            if (!document.getElementById('f-terms').checked) {
                showError('Please agree to the terms and conditions.'); return false;
            }
            d.cardName   = val('f-cardName');
            d.cardNumber = val('f-cardNumber');
            d.cardExpiry = val('f-cardExpiry');
            d.cardCvv    = val('f-cardCvv');
            // Commit check-in
            commitCheckin();
        }
    }

    else if (wizard.type === 'checkout') {
        if (wizard.step === 0) {
            d.checkoutRoomId = val('f-checkout-room');
            if (!d.checkoutRoomId) { showError('Please select a room to check out.'); return false; }
        }
        else if (wizard.step === 2) {
            d.checkoutPayMethod = document.querySelector('input[name="coPayMethod"]:checked')?.value;
            if (!d.checkoutPayMethod) { showError('Please select a payment method.'); return false; }
            if (!document.getElementById('f-co-confirm').checked) {
                showError('Please confirm the guest has acknowledged all charges.'); return false;
            }
            commitCheckout();
        }
    }

    else if (wizard.type === 'reservation') {
        if (wizard.step === 0) {
            if (!collectFields(['firstName','lastName','email','phone'])) return false;
        }
        else if (wizard.step === 1) {
            d.checkIn  = val('f-checkIn');
            d.checkOut = val('f-checkOut');
            d.selectedRoom = val('f-room');
            d.adults   = val('f-adults');
            d.children = val('f-children');
            d.specialRequests = val('f-specialRequests');
            if (!d.checkIn || !d.checkOut || !d.selectedRoom) {
                showError('Please fill in dates and select a room.'); return false;
            }
            if (calcNights(d.checkIn, d.checkOut) < 1) {
                showError('Check-out must be after check-in.'); return false;
            }
            commitReservation();
        }
    }

    return true;
}

function collectFields(ids) {
    const fieldNames = {
        firstName: 'First Name', lastName: 'Last Name', email: 'Email',
        phone: 'Phone', idType: 'ID Type', idNumber: 'ID Number'
    };
    for (const id of ids) {
        const v = val('f-' + id);
        if (!v) {
            showError(`Please fill in: ${fieldNames[id] || id}`);
            document.getElementById('f-' + id)?.focus();
            return false;
        }
        wizard.data[id] = v;
    }
    return true;
}

function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function showError(msg) {
    let err = document.getElementById('wizard-error');
    if (!err) {
        err = document.createElement('div');
        err.id = 'wizard-error';
        err.className = 'wizard-error';
        document.getElementById('wizard-footer').prepend(err);
    }
    err.innerText = msg;
    setTimeout(() => err.remove(), 4000);
}

/* =====================================================
   COMMIT ACTIONS TO STATE
   ===================================================== */
function commitCheckin() {
    const d = wizard.data;
    const room = state.rooms.find(r => r.id === d.selectedRoom);
    const nights = calcNights(d.checkIn, d.checkOut);
    const grand  = d._grand;
    const today  = new Date().toISOString().slice(0, 10);

    const guestId = generateId('G');
    const newGuest = {
        id: guestId,
        firstName: d.firstName, lastName: d.lastName,
        email: d.email, phone: d.phone,
        idType: d.idType, idNumber: d.idNumber,
        nationality: d.nationality, dob: d.dob,
        emergencyName: d.emergencyName, emergencyPhone: d.emergencyPhone,
        roomId: d.selectedRoom, roomType: room.type,
        checkIn: d.checkIn, checkOut: d.checkOut, nights,
        adults: parseInt(d.adults), children: parseInt(d.children),
        specialRequests: d.specialRequests,
        paymentMethod: d.paymentMethod,
        totalCharge: grand, status: 'checked-in'
    };

    state.guests.push(newGuest);
    room.status = 'occupied';

    // If checking in from a reservation, remove it
    if (wizard.prefillResId) {
        state.reservations = state.reservations.filter(r => r.id !== wizard.prefillResId);
    }

    state.transactions.push({
        id: generateId('T'), guestId, guestName: `${d.firstName} ${d.lastName}`,
        roomId: d.selectedRoom, type: 'Check-In', amount: grand,
        paymentMethod: d.paymentMethod, date: today, status: 'Paid'
    });

    saveState();
    renderDashboard();
}

function commitCheckout() {
    const d = wizard.data;
    const g = d._guest;
    const today = new Date().toISOString().slice(0, 10);

    const guest = state.guests.find(gs => gs.id === g.id);
    if (guest) guest.status = 'checked-out';

    const room = state.rooms.find(r => r.id === g.roomId);
    if (room) room.status = 'cleaning';

    state.transactions.push({
        id: generateId('T'), guestId: g.id, guestName: `${g.firstName} ${g.lastName}`,
        roomId: g.roomId, type: 'Check-Out', amount: d._grand,
        paymentMethod: d.checkoutPayMethod, date: today, status: 'Paid'
    });

    saveState();
    renderDashboard();
}

function commitReservation() {
    const d = wizard.data;
    const room = state.rooms.find(r => r.id === d.selectedRoom);
    const confNum = 'INN-' + Math.floor(2000 + Math.random() * 8000);

    state.reservations.push({
        id: generateId('R'),
        confirmationNumber: confNum,
        firstName: d.firstName, lastName: d.lastName,
        email: d.email, phone: d.phone,
        roomType: room.type, roomId: d.selectedRoom,
        checkIn: d.checkIn, checkOut: d.checkOut,
        nights: calcNights(d.checkIn, d.checkOut),
        adults: parseInt(d.adults), children: parseInt(d.children),
        specialRequests: d.specialRequests,
        status: 'confirmed',
        createdAt: new Date().toISOString().slice(0, 10)
    });

    room.status = 'reserved';
    saveState();
    renderDashboard();
}

/* =====================================================
   UTILITIES
   ===================================================== */
function calcNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const ms = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
/* =====================================================
   INIT
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderRooms();
    renderGuests();
    initRoomFilters();
    document.getElementById('guest-search-input').addEventListener('input', e => {
        renderGuests(e.target.value);
    });
});
