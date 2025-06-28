/*
 * South African Address Geocoding and Validation
 * Part of the SA Address Utils library
 * Copyright (c) 2025 SA Address Utils
 */

// Application state
let map, homeMarker, homeLocation = null;

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

async function findAddress(street, suburb) {
  // Clean inputs to avoid duplication
  const cleanStreet = street.replace(/, (Pretoria|Gauteng|South Africa).*$/i, '').trim();
  const cleanSuburb = suburb.replace(/, (Pretoria|Gauteng|South Africa).*$/i, '').trim();
  
  const variations = [
    `${cleanStreet}, ${cleanSuburb}, Pretoria, Gauteng, South Africa`,
    `${cleanStreet}, ${cleanSuburb}, Pretoria, South Africa`,
    `${cleanStreet}, ${cleanSuburb}, Gauteng, South Africa`,
    `${cleanSuburb}, Pretoria, Gauteng, South Africa`,
    `${cleanSuburb}, Pretoria, South Africa`,
    `${cleanSuburb}, Gauteng, South Africa`
  ];
  
  for (let i = 0; i < variations.length; i++) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(variations[i])}&limit=3&countrycodes=za&addressdetails=1`,
        { headers: { 'User-Agent': 'Ward-Boundary-Checker/1.0' } }
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data && data.length > 0) {
        const localResults = data.filter(result => {
          const display = result.display_name.toLowerCase();
          return display.includes('gauteng') || display.includes('pretoria') || display.includes('tshwane');
        });
        
        const bestResult = localResults.length > 0 ? localResults[0] : data[0];
        return {
          coords: [parseFloat(bestResult.lat), parseFloat(bestResult.lon)],
          address: bestResult.display_name
        };
      }
      
      if (i < variations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Address lookup error:`, error);
    }
  }
  return null;
}

function checkEligibility(coords) {
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '56';
  const wardKey = `ward${targetWard}`;
  const boundaries = window.WARD_BOUNDARIES[wardKey];
  
  if (!boundaries) {
    console.error(`No boundaries found for ward ${targetWard}`);
    return false;
  }
  
  return isPointInPolygon(coords, boundaries);
}

function displayResults(location, eligible) {
  const resultEl = document.getElementById('addressResult');
  if (!resultEl) return;
  
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '56';
  
  resultEl.innerHTML = `
    <div class="address-result">
      <strong>🏠 Home Address Found:</strong><br>
      ${location.address}<br>
      <strong>Coordinates:</strong> ${location.coords[0].toFixed(6)}, ${location.coords[1].toFixed(6)}<br>
      <strong>Ward Status:</strong> <span style="color: ${eligible ? '#4CAF50' : '#f44336'}; font-weight: bold;">
        ${eligible ? `✅ Inside Ward ${targetWard}` : `❌ Outside Ward ${targetWard}`}
      </span>
    </div>
  `;
  resultEl.classList.remove('hidden');
  
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
  
  resultEl.innerHTML = `
    <div class="address-result" style="border-left-color: #ff9800; background: #fff3e0;">
      <strong>⚠️ Address Not Found Automatically</strong><br>
      We couldn't locate "${data.streetAddress}, ${data.suburb}" automatically.<br><br>
      <em>Please double check or add the City/Town</em>
    </div>
  `;
  resultEl.classList.remove('hidden');
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
  const btn = document.getElementById('checkAddressBtn');
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '56';
  
  if (eligible === true) {
    showStatus('✅ Eligibility confirmed!', 'success');
    btn.innerHTML = '✅ Eligible to Vote';
    alert(`🎉 Great news! Your home address is INSIDE Ward ${targetWard}.\n\nYou ARE eligible to vote in this by-election!`);
  } else if (eligible === false) {
    showStatus('📝 Not Eligible', 'warning');
    btn.innerHTML = `❌ Outside Ward ${targetWard}`;
    alert(`📍 Your home address is OUTSIDE Ward ${targetWard}.\n\nYou are NOT eligible to vote in this by-election.`);
  } else {
    showStatus('📝 Not Found', 'warning');
    btn.innerHTML = '⏳ Pending Verification';
    alert('📋 Your Address could not be found Automatically.\n\nPlease contact someone at a voting station to confirm');
  }
}

function initializeMap() {
  document.getElementById('map').classList.remove('hidden');
  
  if (map) map.remove();
  
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '56';
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
  
  // Scroll to map after it's fully loaded
  map.whenReady(() => {
    scrollToMap();
  });
}

function addHomeMarker() {
  if (!homeLocation) return;
  
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '56';
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
  const targetWard = window.TARGET_WARD || document.querySelector('meta[name="target-ward"]')?.content || '56';
  
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
