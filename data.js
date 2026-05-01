const DEFAULT_STATE = {
    rooms: [
        { id: '100', type: 'Suite',    rate: 250, status: 'available' },
        { id: '101', type: 'Deluxe',   rate: 175, status: 'available' },
        { id: '102', type: 'Standard', rate: 110, status: 'available' },
        { id: '103', type: 'Suite',    rate: 250, status: 'available' },
        { id: '104', type: 'Standard', rate: 110, status: 'available' },
        { id: '105', type: 'Standard', rate: 110, status: 'occupied'  },
        { id: '106', type: 'Suite',    rate: 250, status: 'occupied'  },
        { id: '107', type: 'Deluxe',   rate: 175, status: 'occupied'  },
        { id: '108', type: 'Standard', rate: 110, status: 'occupied'  },
        { id: '109', type: 'Deluxe',   rate: 175, status: 'cleaning'  },
        { id: '110', type: 'Standard', rate: 110, status: 'reserved'  },
        { id: '111', type: 'Suite',    rate: 250, status: 'occupied'  },
        { id: '112', type: 'Standard', rate: 110, status: 'cleaning'  },
        { id: '113', type: 'Standard', rate: 110, status: 'cleaning'  },
        { id: '114', type: 'Deluxe',   rate: 175, status: 'reserved'  },
        { id: '115', type: 'Standard', rate: 110, status: 'reserved'  },
        { id: '116', type: 'Standard', rate: 110, status: 'available' },
        { id: '117', type: 'Standard', rate: 110, status: 'occupied'  },
        { id: '118', type: 'Suite',    rate: 250, status: 'occupied'  },
        { id: '119', type: 'Deluxe',   rate: 175, status: 'available' },
    ],
    guests: [
        {
            id: 'G001', firstName: 'Maria', lastName: 'Santos',
            email: 'maria.santos@email.com', phone: '555-0105',
            idType: 'Passport', idNumber: 'P8821045',
            roomId: '105', roomType: 'Standard',
            checkIn: '2026-04-20', checkOut: '2026-04-23', nights: 3,
            adults: 1, children: 0, specialRequests: '',
            paymentMethod: 'Credit Card', totalCharge: 330, status: 'checked-in'
        },
        {
            id: 'G002', firstName: 'James', lastName: 'Okafor',
            email: 'james.o@email.com', phone: '555-0106',
            idType: "Driver's License", idNumber: 'DL4492001',
            roomId: '106', roomType: 'Suite',
            checkIn: '2026-04-20', checkOut: '2026-04-23', nights: 3,
            adults: 2, children: 1, specialRequests: 'High floor preferred',
            paymentMethod: 'Credit Card', totalCharge: 750, status: 'checked-in'
        },
        {
            id: 'G003', firstName: 'Aisha', lastName: 'Patel',
            email: 'aisha.p@email.com', phone: '555-0107',
            idType: 'Passport', idNumber: 'P5530192',
            roomId: '107', roomType: 'Deluxe',
            checkIn: '2026-04-20', checkOut: '2026-04-23', nights: 3,
            adults: 2, children: 0, specialRequests: 'Quiet room',
            paymentMethod: 'Debit Card', totalCharge: 525, status: 'checked-in'
        },
        {
            id: 'G004', firstName: 'Carlos', lastName: 'Rivera',
            email: 'carlos.r@email.com', phone: '555-0108',
            idType: "Driver's License", idNumber: 'DL9980234',
            roomId: '108', roomType: 'Standard',
            checkIn: '2026-04-20', checkOut: '2026-04-23', nights: 3,
            adults: 1, children: 0, specialRequests: '',
            paymentMethod: 'Cash', totalCharge: 330, status: 'checked-in'
        }
    ],
    reservations: [
        {
            id: 'R001', confirmationNumber: 'INN-2042',
            firstName: 'Priya', lastName: 'Nair',
            email: 'priya.nair@email.com', phone: '555-0201',
            roomType: 'Deluxe', roomId: '114',
            checkIn: '2026-04-25', checkOut: '2026-04-28', nights: 3,
            adults: 2, children: 0, specialRequests: 'Anniversary trip',
            status: 'confirmed', createdAt: '2026-04-18'
        },
        {
            id: 'R002', confirmationNumber: 'INN-2043',
            firstName: 'Tom', lastName: 'Bradley',
            email: 'tom.b@email.com', phone: '555-0202',
            roomType: 'Standard', roomId: '110',
            checkIn: '2026-04-24', checkOut: '2026-04-26', nights: 2,
            adults: 1, children: 0, specialRequests: '',
            status: 'confirmed', createdAt: '2026-04-19'
        },
        {
            id: 'R003', confirmationNumber: 'INN-2044',
            firstName: 'Lin', lastName: 'Chen',
            email: 'lin.c@email.com', phone: '555-0203',
            roomType: 'Standard', roomId: '115',
            checkIn: '2026-04-26', checkOut: '2026-04-29', nights: 3,
            adults: 2, children: 2, specialRequests: 'Crib needed',
            status: 'confirmed', createdAt: '2026-04-20'
        }
    ],
    transactions: [
        {
            id: 'T001', guestId: 'G001', guestName: 'Maria Santos',
            roomId: '105', type: 'Check-In', amount: 330,
            paymentMethod: 'Credit Card', date: '2026-04-20', status: 'Paid'
        },
        {
            id: 'T002', guestId: 'G002', guestName: 'James Okafor',
            roomId: '106', type: 'Check-In', amount: 750,
            paymentMethod: 'Credit Card', date: '2026-04-20', status: 'Paid'
        },
        {
            id: 'T003', guestId: 'G003', guestName: 'Aisha Patel',
            roomId: '107', type: 'Check-In', amount: 525,
            paymentMethod: 'Debit Card', date: '2026-04-20', status: 'Paid'
        },
        {
            id: 'T004', guestId: 'G004', guestName: 'Carlos Rivera',
            roomId: '108', type: 'Check-In', amount: 330,
            paymentMethod: 'Cash', date: '2026-04-20', status: 'Paid'
        }
    ]
};

function loadState() {
    try {
        const saved = localStorage.getItem('innControlState');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
    localStorage.setItem('innControlState', JSON.stringify(state));
}

function generateId(prefix) {
    return prefix + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
}

const state = loadState();
