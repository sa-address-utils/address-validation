# South African Address Validation Tools

A comprehensive JavaScript library for validating and processing South African addresses, including municipal boundary checking and geocoding utilities.

## 🇿🇦 Features

- **Address Geocoding**: Convert street addresses to GPS coordinates
- **Municipal Boundary Validation**: Check if addresses fall within specific municipal boundaries
- **Ward Boundary Checking**: Determine ward boundaries for local government applications
- **Postal Code Validation**: Verify South African postal codes
- **Suburb/Township Recognition**: Validate suburb and township names
- **Multi-format Address Support**: Handle various South African address formats

## 📦 Installation

### CDN (Recommended)
```html
<!-- Core municipal boundary data -->
<script src="https://sa-address-utils.github.io/address-validation/municipal-bounds.js"></script>

<!-- Address geocoding and validation -->
<script src="https://sa-address-utils.github.io/address-validation/address-geocoder.js"></script>
```

### Local Download
Download the files and include them in your project:
```html
<script src="path/to/municipal-bounds.js"></script>
<script src="path/to/address-geocoder.js"></script>
```

## 🚀 Quick Start

### Basic Address Validation
```javascript
// Initialize the address validator
const validator = new AddressValidator();

// Validate an address
const result = await validator.validateAddress({
    street: "123 Church Street",
    suburb: "Pretoria Central",
    city: "Pretoria",
    province: "Gauteng"
});

console.log(result.isValid); // true/false
console.log(result.coordinates); // [lat, lng]
```

### Municipal Boundary Checking
```javascript
// Check if address falls within municipal boundaries
const boundaryChecker = new MunicipalBoundaryChecker();

const isWithinBoundary = await boundaryChecker.checkBoundary({
    address: "456 Main Road, Hatfield, Pretoria",
    municipalityCode: "TSH" // Tshwane Metropolitan Municipality
});

console.log(isWithinBoundary); // true/false
```

### Ward Boundary Validation
```javascript
// Determine ward boundaries for local government applications
const wardChecker = new WardBoundaryValidator();

const wardInfo = await wardChecker.getWardInfo({
    coordinates: [-25.7479, 28.2293],
    municipality: "Tshwane"
});

console.log(wardInfo.wardNumber); // e.g., "Ward 56"
console.log(wardInfo.councillor); // Ward councillor information
```

## 📍 Supported Areas

This library provides comprehensive coverage for:

### Metros
- **Tshwane Metropolitan Municipality** (Pretoria)
- **City of Johannesburg** (Johannesburg)
- **City of Cape Town** (Cape Town)
- **eThekwini Metropolitan Municipality** (Durban)

### Provinces
- Gauteng
- Western Cape  
- KwaZulu-Natal
- Eastern Cape
- Free State
- Limpopo
- Mpumalanga
- North West
- Northern Cape

## 🔧 Configuration

### Custom Boundary Data
```javascript
// Load custom municipal boundary data
const customBoundaries = {
    municipality: "Custom Municipality",
    boundaries: [
        [-25.7479, 28.2293],
        [-25.7489, 28.2303],
        // ... more coordinates
    ]
};

boundaryChecker.loadCustomBoundaries(customBoundaries);
```

### Geocoding Options
```javascript
const geocoder = new AddressGeocoder({
    provider: 'google', // 'google', 'osm', 'here'
    fallbackProviders: ['osm'], // Fallback if primary fails
    cacheResults: true, // Cache geocoding results
    timeout: 5000 // Request timeout in ms
});
```

## 📊 Use Cases

### Municipal Services
- Utility connection verification
- Service delivery planning
- Property tax assessment
- Waste collection routing

### Government Applications
- Voter registration systems
- Census data collection
- Emergency services dispatch
- Municipal planning

### Business Applications
- Delivery area validation
- Service coverage checking
- Market analysis
- Location-based services

### Civic Tech Projects
- Community engagement platforms
- Public service applications
- Government transparency tools
- Local democracy platforms

## 🛠️ API Reference

### AddressValidator
```javascript
// Validate address format and existence
validateAddress(addressObject)
validatePostalCode(postalCode)
standardizeAddress(addressString)
```

### MunicipalBoundaryChecker
```javascript
// Check municipal boundaries
checkBoundary(addressObject, municipalityCode)
getMunicipalityInfo(coordinates)
listSupportedMunicipalities()
```

### WardBoundaryValidator
```javascript
// Ward-level boundary checking
getWardInfo(coordinates, municipality)
checkWardBoundary(address, wardNumber)
getWardCouncillor(wardNumber, municipality)
```

## 🌍 Data Sources

This library uses data from:
- **Municipal Demarcation Board** (South Africa)
- **Statistics South Africa** (Census data)
- **OpenStreetMap** (Geographic data)
- **Google Maps Geocoding API** (Address validation)
- **South African Post Office** (Postal codes)

## 📈 Performance

- **Lightweight**: Core library < 50KB minified
- **Fast**: Address validation typically < 200ms
- **Reliable**: Multiple fallback geocoding providers
- **Cached**: Results cached to minimize API calls

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/sa-address-utils/address-validation.git
cd address-validation
npm install
npm run dev
```

### Running Tests
```bash
npm test
npm run test:coverage
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Municipal Demarcation Board of South Africa
- OpenStreetMap contributors
- South African geocoding community
- Various municipal data providers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/sa-address-utils/address-validation/issues)
- **Documentation**: [Wiki](https://github.com/sa-address-utils/address-validation/wiki)
- **Community**: [Discussions](https://github.com/sa-address-utils/address-validation/discussions)

## 🗺️ Roadmap

- [ ] Support for traditional authority areas
- [ ] Integration with SARS postal code database
- [ ] Real-time boundary updates
- [ ] Mobile-optimized library
- [ ] Additional geocoding providers
- [ ] Bulk address validation API

---

**Note**: This is a community-maintained project. For official municipal boundary data, please consult the Municipal Demarcation Board of South Africa.

*Built with ❤️ for the South African developer community*
