/*
 * South African Address Geocoding and Validation
 * Part of the SA Address Utils library
 * Copyright (c) 2025 SA Address Utils
 */

// Application state
let map, homeMarker, homeLocation = null, manualMode = false;

// Initialize when called by authenticated system
function initializeApp() {
  // Verify dependencies are loaded
  if (!window.WARD_BOUNDARIES || !window.FORM_CONFIG) {
    console.error('Required dependencies not loaded');
    return;
  }
  
  // Add event listeners
  const btn = document.getElementById('checkAddressBtn');
  if (btn) {
    btn.addEventListener('click', processAddress);
  }
  
  // Add test button for manual mode
  const testBtn = document.getElementById('testManualBtn');
  if (testBtn) {
    testBtn.addEventListener('click', function() {
      console.log('Test manual mode button clicked');
      startManualCheck();
    });
  }
}

function showStatus(msg, type = 'loading') {
  const el = document.getElementById('status');
  if (el) {
    el.innerHTML = msg;
    el.className = `status-message status-${type}`;
  }
}

async function processAddress() {
  const data = getFormData();
  if (!validateFormData(data)) return;
  
  const btn = document.getElementById('checkAddressBtn');
  btn.disabled = true;
  btn.innerHTML = '⏳ Processing...';
  
  showStatus('🔍 Looking up your home address...', 'loading');
  
  const location = await findAddress(data.streetAddress, data.suburb);
  
  if (location) {
    homeLocation = location.coords;
    const eligibility = checkEligibility(homeLocation);
    displayResults(location, eligibility);
    await submitForm({...data, location: location, eligible: eligibility});
    showFinalStatus(eligibility);
  } else {
    displayNoResults(data);
    await submitForm({...data, location: null, eligible: null});
    showFinalStatus(null);
  }
}

function getFormData() {
  return {
    firstName: document.getElementById('firstName')?.value || '',
    lastName: document.getElementById('lastName')?.value || '',
    streetAddress: document.getElementById('streetAddress')?.value || '',
    suburb: document.getElementById('suburb')?.value || '',
    cellphone: document.getElementById('cellphone')?.value || ''
  };
}

function validateFormData(data) {
  const required = ['firstName', 'lastName', 'streetAddress', 'suburb', 'cellphone'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    alert('Please fill in all required fields before submitting.');
    return false;
  }
  return true;
}

// Helper function to normalize address case
function normalizeAddressCase(text) {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle common abbreviations and special cases
      const upperCaseWords = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW', 'GP', 'ZA'];
      if (upperCaseWords.includes(word.toUpperCase())) {
        return word.toUpperCase();
      }
      
      // Handle ordinal numbers (1st, 2nd, 3rd, etc.)
      if (/^\d+(st|nd|rd|th)$/.test(word)) {
        return word;
      }
      
      // Regular title case for most words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

async function findAddress(street, suburb) {
  console.log('Finding address for (original):', street, suburb);
  
  // Clean and normalize case
  const cleanStreet = normalizeAddressCase(
    street.replace(/, (Pretoria|Gauteng|South Africa).*$/i, '').trim()
  );
  const cleanSuburb = normalizeAddressCase(
    suburb.replace(/, (Pretoria|Gauteng|South Africa).*$/i, '').trim()
  );
  
  console.log('Normalized addresses:', cleanStreet, cleanSuburb);
  
  const variations = [
    `${cleanStreet}, ${cleanSuburb}, Pretoria, Gauteng, South Africa`,
    `${cleanStreet}, ${cleanSuburb}, Pretoria, South Africa`,
    `${cleanStreet}, ${cleanSuburb}, Gauteng, South Africa`,
    `${cleanSuburb}, Pretoria, Gauteng, South Africa`,
    `${cleanSuburb}, Pretoria, South Africa`,
    `${cleanSuburb}, Gauteng, South Africa`
  ];
  
  console.log('Trying address variations:', variations);
  
  for (let i = 0; i < variations.length; i++) {
    try {
      console.log(`Attempt ${i+1}: ${variations[i]}`);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(variations[i])}&limit=3&countrycodes=za&addressdetails=1`,
        { headers: { 'User-Agent': 'Ward-Boundary-Checker/1.0' } }
      );
      
      if (!response.ok) {
        console.log(`Response not OK: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`Results for attempt ${i+1}:`, data);
      
      if (data && data.length > 0) {
        const localResults = data.filter(result => {
          const display = result.display_name.toLowerCase();
          return display.includes('gauteng') || display.includes('pretoria') || display.includes('tshwane');
        });
        
        const bestResult = localResults.length > 0 ? localResults[0] : data[0];
        console.log('Best result found:', bestResult);
        
        return {
          coords: [parseFloat(bestResult.lat), parseFloat(bestResult.lon)],
          address: bestResult.display_name
        };
      }
      
      if (i < variations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Address lookup error on attempt ${i+1}:`, error);
    }
  }
  
  console.log('No address found after all attempts');
  return null;
}

function checkEligibility(coords) {
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '44';
  const wardKey = `ward${targetWard}`;
  const boundaries = window.WARD_BOUNDARIES[wardKey];
  
  console.log('Checking eligibility for:', coords);
  console.log('Target ward:', targetWard);
  console.log('Ward boundaries available:', !!boundaries);
  
  if (!boundaries) {
    console.error(`No boundaries found for ward ${targetWard}`);
    return false;
  }
  
  const result = isPointInPolygon(coords, boundaries);
  console.log('Point in polygon result:', result);
  return result;
}

function displayResults(location, eligible) {
  const resultEl = document.getElementById('addressResult');
  if (!resultEl) return;
  
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '44';
  
  resultEl.innerHTML = `
    <div class="address-result">
      <strong>🏠 Home Address Found:</strong><br>
      ${location.address}<br>
      <strong>Coordinates:</strong> ${location.coords[0].toFixed(6)}, ${location.coords[1].toFixed(6)}<br>
      <strong>Ward Status:</strong> <span style="color: ${eligible ? '#4CAF50' : '#f44336'}; font-weight: bold;">
        ${eligible ? `✅ Inside Ward ${targetWard}` : `❌ Outside Ward ${targetWard}`}
      </span>
    </div>
    
    <div class="address-result" style="border-left-color: #2196F3; background: #e3f2fd; margin-top: 15px;">
      <strong>🎯 Want to double-check visually?</strong><br>
      View the map below to see your location relative to Ward ${targetWard} boundaries.<br><br>
      
      <button type="button" class="manual-check-btn" id="manualCheckButton2">
        🗺️ Verify Visually on Map
      </button>
      
      <div class="manual-instruction hidden" id="manualInstructions2">
        <strong>📍 Visual Verification:</strong><br>
        1. The map shows Ward ${targetWard} boundaries (green area)<br>
        2. Click anywhere on the map to see if that location is inside or outside the ward<br>
        3. Green markers = Inside Ward, Red markers = Outside Ward<br>
        4. This is just for visual confirmation - no data is submitted
      </div>
    </div>
  `;
  resultEl.classList.remove('hidden');
  
  // Show the test manual mode button now that we have a result
  const testBtn = document.getElementById('testManualBtn');
  if (testBtn) {
    testBtn.classList.remove('hidden');
  }
  
  // Add event listener to the manual verification button
  const manualBtn = document.getElementById('manualCheckButton2');
  if (manualBtn) {
    manualBtn.addEventListener('click', startManualCheck);
  }
  
  if (map) {
    addHomeMarker();
    scrollToMap();
  } else {
    initializeMap();
  }
}

function displayNoResults(data) {
  const resultEl = document.getElementById('addressResult');
  if (!resultEl) return;
  
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '44';
  
  resultEl.innerHTML = `
    <div class="address-result warning">
      <strong>⚠️ Address Not Found Automatically</strong><br>
      We couldn't locate "${data.streetAddress}, ${data.suburb}" automatically.<br><br>
      <em>📍 Address lookups are not always 100% accurate</em><br><br>
      
      <button type="button" class="manual-check-btn" id="manualCheckButton">
        🗺️ Check Visually on Map
      </button>
      
      <div class="manual-instruction hidden" id="manualInstructions">
        <strong>📍 Visual Checking:</strong><br>
        1. The map shows Ward ${targetWard} boundaries (green area)<br>
        2. Click anywhere on the map to see if that location is inside or outside the ward<br>
        3. Green markers = Inside Ward, Red markers = Outside Ward<br>
        4. Use this to visually confirm your eligibility
      </div>
    </div>
  `;
  resultEl.classList.remove('hidden');
  
  // Show the test manual mode button now that we have a result (even if failed)
  const testBtn = document.getElementById('testManualBtn');
  if (testBtn) {
    testBtn.classList.remove('hidden');
  }
  
  // Add event listener to the manual check button
  const manualBtn = document.getElementById('manualCheckButton');
  if (manualBtn) {
    manualBtn.addEventListener('click', startManualCheck);
  }
}

function startManualCheck() {
  manualMode = true;
  console.log('Starting manual check mode...');
  
  // Show instructions - try both possible instruction divs
  const instructions = document.getElementById('manualInstructions');
  const instructions2 = document.getElementById('manualInstructions2');
  if (instructions) {
    instructions.classList.remove('hidden');
  }
  if (instructions2) {
    instructions2.classList.remove('hidden');
  }
  
  // Update status
  showStatus('🗺️ Loading map... Click anywhere to check if that location is inside Ward boundaries', 'loading');
  
  // Initialize or show map
  if (map) {
    console.log('Map exists, enabling manual mode...');
    // Map already exists, just enable manual mode
    enableManualMode();
    // Scroll to map
    setTimeout(() => {
      scrollToMap();
    }, 500);
  } else {
    console.log('Initializing new map...');
    // Initialize map first
    initializeMap();
  }
}

function enableManualMode() {
  if (!map) {
    console.error('Map not initialized for manual mode');
    return;
  }
  
  console.log('Enabling manual mode...');
  
  // Remove any existing click handlers
  map.off('click');
  
  // Add new click handler for manual selection
  map.on('click', function(e) {
    console.log('Map clicked at:', e.latlng);
    
    const coords = [e.latlng.lat, e.latlng.lng];
    homeLocation = coords;
    
    // Check eligibility for clicked location
    const eligible = checkEligibility(coords);
    console.log('Eligibility check result:', eligible);
    
    // Add/update marker
    addManualMarker(coords, eligible);
    
    // Show result (no form submission)
    displayManualResult(coords, eligible);
  });
  
  // Change cursor to crosshair when in manual mode
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.style.cursor = 'crosshair';
  }
  
  // Update status
  showStatus('🎯 Click anywhere on the map to check eligibility for that location', 'loading');
  
  // Update legend to show manual mode
  addMapLegend();
}

function addManualMarker(coords, eligible) {
  console.log('Adding manual marker at:', coords, 'Eligible:', eligible);
  
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '44';
  const markerColor = eligible ? '#4CAF50' : '#f44336';
  
  const homeIcon = L.divIcon({
    html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 20% 20% 20% 70%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); transform: rotate(-45deg);"></div>`,
    iconSize: [24, 24],
    className: 'custom-marker'
  });
  
  if (homeMarker) {
    map.removeLayer(homeMarker);
  }
  
  homeMarker = L.marker(coords, { icon: homeIcon })
    .addTo(map)
    .bindPopup(`
      <strong>📍 Checked Location</strong><br>
      ${eligible ? `✅ Inside Ward ${targetWard}` : `❌ Outside Ward ${targetWard}`}<br>
      <small>${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}</small><br>
      <em>Click elsewhere to check another location</em>
    `, { autoClose: false })
    .openPopup();
}

function displayManualResult(coords, eligible) {
  console.log('Displaying manual result:', eligible);
  
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '44';
  
  showStatus(
    eligible ? 
    `✅ That location is INSIDE Ward ${targetWard}! Click elsewhere to check other locations.` : 
    `❌ That location is OUTSIDE Ward ${targetWard}. Click elsewhere to check other locations.`,
    eligible ? 'success' : 'error'
  );
}

async function submitForm(data) {
  try {
    const formData = new FormData();
    const config = window.FORM_CONFIG;
    
    formData.append(config.fields.firstName, data.firstName);
    formData.append(config.fields.lastName, data.lastName);
    formData.append(config.fields.streetAddress, data.streetAddress);
    formData.append(config.fields.suburb, data.suburb);
    formData.append(config.fields.cellphone, data.cellphone);
    
    const gpsData = data.location ? 
      `${data.location.coords[0].toFixed(6)}, ${data.location.coords[1].toFixed(6)}` : 
      'Not found automatically';
    formData.append(config.fields.gpsPin, gpsData);
    
    await fetch(config.url, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
    
    return true;
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

function showFinalStatus(eligible) {
  if (manualMode) {
    console.log('Skipping final status in manual mode');
    return; // Don't override manual mode status
  }
  
  const btn = document.getElementById('checkAddressBtn');
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '44';
  
  if (eligible === true) {
    showStatus('✅ Eligibility confirmed!', 'success');
    btn.innerHTML = '✅ Eligible to Vote';
    alert(`🎉 Great news! Your home address is INSIDE Ward ${targetWard}.\n\nYou ARE eligible to vote in this by-election!`);
  } else if (eligible === false) {
    showStatus('📝 Not Eligible', 'warning');
    btn.innerHTML = `❌ Outside Ward ${targetWard}`;
    alert(`📍 Your home address is OUTSIDE Ward ${targetWard}.\n\nYou are NOT eligible to vote in this by-election.`);
  } else {
    showStatus('📝 Address lookup failed - try visual check below', 'warning');
    btn.innerHTML = '🗺️ Try Visual Check';
  }
  
  btn.disabled = false;
}

function initializeMap() {
  document.getElementById('map').classList.remove('hidden');
  
  if (map) map.remove();
  
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '44';
  const wardKey = `ward${targetWard}`;
  const boundaries = window.WARD_BOUNDARIES[wardKey];
  
  if (!boundaries) {
    console.error(`No boundaries found for ward ${targetWard}`);
    return;
  }
  
  // Calculate center of ward boundaries
  const lats = boundaries.map(coord => coord[0]);
  const lngs = boundaries.map(coord => coord[1]);
  const wardCenter = [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2
  ];
  
  map = L.map('map').setView(wardCenter, 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  const polygon = L.polygon(boundaries, {
    color: '#4CAF50',
    fillColor: '#4CAF50',
    fillOpacity: 0.2,
    weight: 3
  }).addTo(map);
  
  addMapLegend();
  map.fitBounds(polygon.getBounds().pad(0.1));
  
  if (homeLocation) addHomeMarker();
  
  // Wait for map to be ready, then enable manual mode if needed
  map.whenReady(() => {
    if (manualMode) {
      console.log('Map ready, enabling manual mode...');
      enableManualMode();
    }
    scrollToMap();
  });
}

function addHomeMarker() {
  if (!homeLocation) return;
  
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '44';
  const wardKey = `ward${targetWard}`;
  const boundaries = window.WARD_BOUNDARIES[wardKey];
  
  if (!boundaries) {
    console.error(`No boundaries found for ward ${targetWard}`);
    return;
  }
  
  const inWard = isPointInPolygon(homeLocation, boundaries);
  const markerColor = inWard ? '#4CAF50' : '#f44336';
  
  const homeIcon = L.divIcon({
    html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 20% 20% 20% 70%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); transform: rotate(-45deg);"></div>`,
    iconSize: [24, 24],
    className: 'custom-marker'
  });
  
  if (homeMarker) map.removeLayer(homeMarker);
  
  homeMarker = L.marker(homeLocation, { icon: homeIcon })
    .addTo(map)
    .bindPopup(`
      <strong>🏠 Your Home Address</strong><br>
      ${inWard ? `✅ Inside Ward ${targetWard}` : `❌ Outside Ward ${targetWard}`}<br>
      <small>${homeLocation[0].toFixed(6)}, ${homeLocation[1].toFixed(6)}</small>
    `)
    .openPopup();
  
  const polygon = L.polygon(boundaries);
  const group = new L.featureGroup([polygon, homeMarker]);
  map.fitBounds(group.getBounds().pad(0.1));
}

function addMapLegend() {
  const legend = L.control({position: 'bottomright'});
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '44';
  
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
      <h4>Legend</h4>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #4CAF50;"></div>
        <span>Inside Ward ${targetWard}</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #f44336;"></div>
        <span>Outside Ward ${targetWard}</span>
      </div>
      ${manualMode ? '<p style="margin: 5px 0; font-size: 12px;"><em>Click map to check any location</em></p>' : ''}
    `;
    return div;
  };
  
  legend.addTo(map);
}

// Point in polygon algorithm
function isPointInPolygon(point, polygon) {
  if (!point || !polygon || !polygon.length) {
    console.error('Invalid point or polygon data:', { point, polygon });
    return false;
  }
  
  const [lat, lng] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat1, lng1] = polygon[i];
    const [lat2, lng2] = polygon[j];
    
    if (((lat1 > lat) !== (lat2 > lat)) && 
        (lng < (lng2 - lng1) * (lat - lat1) / (lat2 - lat1) + lng1)) {
      inside = !inside;
    }
  }
  
  return inside;
}

function scrollToMap() {
  setTimeout(() => {
    const mapElement = document.getElementById('map');
    if (mapElement && !mapElement.classList.contains('hidden')) {
      mapElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, 1000);
}

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeApp, processAddress, findAddress, checkEligibility };
}