// dashboard.js
import { database, auth } from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

// Check authentication
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        document.getElementById('adminEmail').textContent = user.email;
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'login.html';
});

// Real-time data listener
const dustbinRef = ref(database, '/dustbin');
let lastFullAlert = false;

onValue(dustbinRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
        // Update UI
        document.getElementById('lidTime').textContent = data.lid_open_time || 0;
        document.getElementById('dryWaste').textContent = (data.dry_waste_kg || 0).toFixed(1);
        document.getElementById('wetWaste').textContent = (data.wet_waste_kg || 0).toFixed(1);
        
        const total = (data.dry_waste_kg || 0) + (data.wet_waste_kg || 0);
        document.getElementById('totalWaste').textContent = total.toFixed(1);
        
        // Update fill level
        const fillPercent = data.fill_percentage || 0;
        const fillBar = document.getElementById('fillBar');
        fillBar.style.width = fillPercent + '%';
        document.getElementById('fillPercent').textContent = fillPercent;
        
        // Change color based on fill level
        if (fillPercent > 80) {
            fillBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            document.getElementById('fillStatus').innerHTML = '⚠️ Dustbin is almost full! Please empty soon.';
            
            // Send email alert when full (only once)
            if (!lastFullAlert && fillPercent >= 95) {
                sendEmailAlert(auth.currentUser?.email, fillPercent, data);
                lastFullAlert = true;
                addLogEntry(`🚨 ALERT: Dustbin is ${fillPercent}% full! Email sent to admin.`);
            }
        } else {
            fillBar.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
            document.getElementById('fillStatus').innerHTML = '✅ Dustbin status: Normal';
            if (fillPercent < 90) lastFullAlert = false;
        }
        
        // Update waste type display
        const wasteType = data.current_waste_type || 'unknown';
        updateWasteTypeDisplay(wasteType);
        
        // Update status badges
        updateStatusBadges(data.dry_waste_kg, data.wet_waste_kg);
        
        // Update timestamp
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        
        // Add activity log
        if (data.last_activity) {
            addLogEntry(data.last_activity);
        }
    }
});

// Function to update waste type display
function updateWasteTypeDisplay(type) {
    const displayDiv = document.getElementById('wasteTypeDisplay');
    const icon = displayDiv.querySelector('.waste-icon');
    const text = displayDiv.querySelector('.waste-text');
    
    switch(type) {
        case 'dry':
            icon.textContent = '🗑️';
            text.textContent = 'Dry Waste Detected';
            displayDiv.style.borderLeft = '5px solid #8B4513';
            break;
        case 'wet':
            icon.textContent = '💧';
            text.textContent = 'Wet Waste Detected';
            displayDiv.style.borderLeft = '5px solid #2196F3';
            break;
        default:
            icon.textContent = '🔄';
            text.textContent = 'Waiting for sensor...';
            displayDiv.style.borderLeft = '5px solid #999';
    }
}

// Update status badges
function updateStatusBadges(dry, wet) {
    const dryStatus = document.getElementById('dryStatus');
    const wetStatus = document.getElementById('wetStatus');
    
    if (dry > 10) {
        dryStatus.textContent = '⚠️ Needs Emptying';
        dryStatus.classList.add('full');
    } else {
        dryStatus.textContent = '✅ Normal';
        dryStatus.classList.remove('full');
    }
    
    if (wet > 10) {
        wetStatus.textContent = '⚠️ Needs Emptying';
        wetStatus.classList.add('full');
    } else {
        wetStatus.textContent = '✅ Normal';
        wetStatus.classList.remove('full');
    }
}

// Activity log
function addLogEntry(message) {
    const logContainer = document.getElementById('activityLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    // Keep only last 20 entries
    while (logContainer.children.length > 20) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// Email alert function (using EmailJS or similar service)
async function sendEmailAlert(adminEmail, fillPercent, data) {
    // Option 1: Using EmailJS (free tier)
    // Sign up at emailjs.com and get your credentials
    
    const serviceId = 'YOUR_SERVICE_ID';
    const templateId = 'YOUR_TEMPLATE_ID';
    const userId = 'YOUR_USER_ID';
    
    const templateParams = {
        to_email: adminEmail,
        fill_percentage: fillPercent,
        dry_waste: data.dry_waste_kg,
        wet_waste: data.wet_waste_kg,
        timestamp: new Date().toLocaleString(),
        message: `Dustbin is ${fillPercent}% full! Please empty immediately.`
    };
    
    // Uncomment after setting up EmailJS
    /*
    emailjs.send(serviceId, templateId, templateParams, userId)
        .then(() => console.log('Email sent successfully'))
        .catch(error => console.error('Email error:', error));
    */
    
    // Option 2: Using SMTP.js (simpler)
    console.log('Email would be sent to:', adminEmail, 'Fill:', fillPercent + '%');
    addLogEntry(`📧 Email alert triggered for ${fillPercent}% fill level`);
}

// Simulate sensor data (for testing - remove in production)
setInterval(() => {
    const randomFill = Math.floor(Math.random() * 100);
    const mockData = {
        lid_open_time: (Math.random() * 10).toFixed(1),
        fill_percentage: randomFill,
        dry_waste_kg: Math.random() * 15,
        wet_waste_kg: Math.random() * 12,
        current_waste_type: Math.random() > 0.5 ? 'dry' : 'wet',
        last_activity: `Sensor reading: ${Math.random() > 0.5 ? 'Dry' : 'Wet'} waste detected`
    };
    
    // For testing only - remove when using real ESP8266 data
    // window.mockDataUpdate(mockData);
}, 5000);