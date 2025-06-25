# SA Address Validation API Documentation

## Overview

The SA Address Validation library provides comprehensive tools for validating and processing South African addresses, postal codes, and administrative boundaries.

## Installation

### Browser
```html
<script src="https://sa-address-utils.github.io/address-validation/postal-codes.js"></script>
<script src="https://sa-address-utils.github.io/address-validation/province-validator.js"></script>
<script src="https://sa-address-utils.github.io/address-validation/municipal-bounds.js"></script>
<script src="https://sa-address-utils.github.io/address-validation/address-geocoder.js"></script>
```

### Node.js
```bash
npm install sa-address-validation
```

## API Reference

### PostalCodeValidator

#### `PostalCodeValidator.validate(postalCode)`

Validates a South African postal code.

**Parameters:**
- `postalCode` (string|number): The postal code to validate

**Returns:**
```javascript
{
  valid: boolean,
  code?: string,        // Cleaned postal code
  province?: string,    // Province name
  region?: string,      // Region/city name
  error?: string        // Error message if invalid
}
```

**Example:**
```javascript
const result = PostalCodeValidator.validate('0001');
// Returns: { valid: true, code: '0001', province: 'GAUTENG', region: 'PRETORIA CENTRAL' }
```

#### `PostalCodeValidator.getProvince(postalCode)`

Gets the province for a postal code.

**Parameters:**
- `postalCode` (string|number): The postal code

**Returns:** `string|null` - Province name or null if invalid

#### `PostalCodeValidator.isValidForProvince(postalCode, province)`

Checks if a postal code is valid for a specific province.

**Parameters:**
- `postalCode` (string|number): The postal code
- `province` (string): The province name

**Returns:** `boolean`

#### `PostalCodeValidator.suggestCorrection(invalidCode)`

Suggests corrections for invalid postal codes.

**Parameters:**
- `invalidCode` (string|number): Invalid postal code

**Returns:** Array of suggestion objects

---

### ProvinceValidator

#### `ProvinceValidator.validate(province)`

Validates a South African province name.

**Parameters:**
- `province` (string): Province name, code, or alias

**Returns:**
```javascript
{
  valid: boolean,
  province?: string,      // Official province name
  capital?: string,       // Province capital
  code?: string,          // Province code (e.g., 'GP')
  key?: string,           // Internal key
  error?: string,         // Error message if invalid
  suggestions?: string[]  // Suggested corrections
}
```

**Example:**
```javascript
const result = ProvinceValidator.validate('GP');
// Returns: { valid: true, province: 'Gauteng', capital: 'Johannesburg', code: 'GP', key: 'gauteng' }
```

#### `ProvinceValidator.getProvinces()`

Gets list of all South African provinces.

**Returns:** Array of province objects

#### `ProvinceValidator.getByCode(code)`

Gets province information by province code.

**Parameters:**
- `code` (string): Province code (e.g., 'GP', 'WC')

**Returns:** Province object or null

#### `ProvinceValidator.isValidProvince(province)`

Quick validation check.

**Parameters:**
- `province` (string): Province to validate

**Returns:** `boolean`

#### `ProvinceValidator.normalizeProvinceName(province)`

Normalizes province name to official format.

**Parameters:**
- `province` (string): Province name/code/alias

**Returns:** `string|null` - Official province name or null

---

### SecureWardSystem

Advanced municipal boundary validation system.

#### `SecureWardSystem.unlock(authKey)`

Unlocks protected boundary data with authentication.

**Parameters:**
- `authKey` (string): Authentication key

**Returns:**
```javascript
{
  ward_boundaries: Array,    // Boundary coordinates
  form_config: Object,      // Form configuration
  authenticated: boolean,   // Authentication status
  message?: string         // Status message
}
```

**Note:** This function requires proper authentication for full access to boundary data.

---

## Usage Examples

### Basic Validation

```javascript
// Validate postal code
const postal = PostalCodeValidator.validate('2000');
if (postal.valid) {
    console.log(`Valid postal code for ${postal.province}`);
}

// Validate province
const province = ProvinceValidator.validate('Western Cape');
if (province.valid) {
    console.log(`Capital: ${province.capital}`);
}
```

### Form Validation

```javascript
function validateAddressForm(formData) {
    const errors = [];
    
    // Validate postal code
    const postalResult = PostalCodeValidator.validate(formData.postalCode);
    if (!postalResult.valid) {
        errors.push(`Postal Code: ${postalResult.error}`);
    }
    
    // Validate province
    const provinceResult = ProvinceValidator.validate(formData.province);
    if (!provinceResult.valid) {
        errors.push(`Province: ${provinceResult.error}`);
    }
    
    // Check if postal code matches province
    if (postalResult.valid && provinceResult.valid) {
        const matches = PostalCodeValidator.isValidForProvince(
            formData.postalCode, 
            formData.province
        );
        if (!matches) {
            errors.push('Postal code does not match the selected province');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}
```

### Address Autocomplete

```javascript
// Get province from postal code
const postalCode = '0001';
const province = PostalCodeValidator.getProvince(postalCode);
// Returns: 'GAUTENG'

// Normalize province input
const normalized = ProvinceValidator.normalizeProvinceName('GP');
// Returns: 'Gauteng'
```

## Error Handling

All validation functions return structured error information:

```javascript
const result = PostalCodeValidator.validate('invalid');
if (!result.valid) {
    console.error(result.error);
    // Handle validation error
}
```

## Browser Compatibility

- Modern browsers (ES6+)
- Internet Explorer 11+ (with polyfills)
- Mobile browsers

## License

MIT License - see LICENSE file for details.

## Contributing

See CONTRIBUTING.md for contribution guidelines.

## Support

For issues and questions:
- GitHub Issues: https://github.com/sa-address-utils/address-validation/issues
- Documentation: https://sa-address-utils.github.io/address-validation