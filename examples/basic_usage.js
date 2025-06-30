/*
 * SA Address Validation Library - Basic Usage Examples
 * Run with: node examples/basic-usage.js
 */

// Import the validators (if using in Node.js)
// const PostalCodeValidator = require('../postal-codes.js');
// const ProvinceValidator = require('../province-validator.js');

// For browser usage, just include the script tags and use directly

console.log('=== SA Address Validation Library Examples ===\n');

// Example 1: Postal Code Validation
console.log('1. Postal Code Validation:');
console.log('-------------------------------');

const testPostalCodes = ['0001', '2000', '8000', '9999', '1234'];

testPostalCodes.forEach(code => {
    if (typeof PostalCodeValidator !== 'undefined') {
        const result = PostalCodeValidator.validate(code);
        if (result.valid) {
            console.log(`✅ ${code} - Valid (${result.province}, ${result.region})`);
        } else {
            console.log(`❌ ${code} - ${result.error}`);
        }
    } else {
        console.log(`Testing postal code: ${code}`);
    }
});

console.log('\n');

// Example 2: Province Validation
console.log('2. Province Validation:');
console.log('-------------------------------');

const testProvinces = ['Gauteng', 'GP', 'Western Cape', 'KZN', 'InvalidProvince'];

testProvinces.forEach(province => {
    if (typeof ProvinceValidator !== 'undefined') {
        const result = ProvinceValidator.validate(province);
        if (result.valid) {
            console.log(`✅ "${province}" - Valid (${result.province}, capital: ${result.capital})`);
        } else {
            console.log(`❌ "${province}" - ${result.error}`);
            if (result.suggestions.length > 0) {
                console.log(`   Suggestions: ${result.suggestions.join(', ')}`);
            }
        }
    } else {
        console.log(`Testing province: "${province}"`);
    }
});

console.log('\n');

// Example 3: Address Formatting
console.log('3. Address Validation Examples:');
console.log('-------------------------------');

const testAddresses = [
    {
        street: '123 Church Street',
        suburb: 'Hatfield',
        city: 'Pretoria',
        province: 'Gauteng',
        postalCode: '0028'
    },
    {
        street: '456 Long Street',
        suburb: 'Cape Town City Centre',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8000'
    }
];

testAddresses.forEach((address, index) => {
    console.log(`Address ${index + 1}:`);
    console.log(`  Street: ${address.street}`);
    console.log(`  Suburb: ${address.suburb}`);
    console.log(`  City: ${address.city}`);
    
    // Validate province
    if (typeof ProvinceValidator !== 'undefined') {
        const provinceResult = ProvinceValidator.validate(address.province);
        if (provinceResult.valid) {
            console.log(`  Province: ✅ ${provinceResult.province} (${provinceResult.code})`);
        } else {
            console.log(`  Province: ❌ ${address.province} - Invalid`);
        }
    }
    
    // Validate postal code
    if (typeof PostalCodeValidator !== 'undefined') {
        const postalResult = PostalCodeValidator.validate(address.postalCode);
        if (postalResult.valid) {
            console.log(`  Postal Code: ✅ ${address.postalCode} (${postalResult.region})`);
            
            // Check if postal code matches province
            const isMatch = PostalCodeValidator.isValidForProvince(address.postalCode, address.province);
            console.log(`  Province/Postal Match: ${isMatch ? '✅' : '❌'}`);
        } else {
            console.log(`  Postal Code: ❌ ${address.postalCode} - ${postalResult.error}`);
        }
    }
    
    console.log('');
});

// Example 4: Practical Usage Scenarios
console.log('4. Practical Usage Scenarios:');
console.log('-------------------------------');

console.log('Scenario A: Form Validation');
function validateAddressForm(formData) {
    const errors = [];
    
    // This would work if the validators are loaded
    if (typeof PostalCodeValidator !== 'undefined') {
        const postalResult = PostalCodeValidator.validate(formData.postalCode);
        if (!postalResult.valid) {
            errors.push(`Postal Code: ${postalResult.error}`);
        }
    }
    
    if (typeof ProvinceValidator !== 'undefined') {
        const provinceResult = ProvinceValidator.validate(formData.province);
        if (!provinceResult.valid) {
            errors.push(`Province: ${provinceResult.error}`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

const sampleForm = {
    postalCode: '0001',
    province: 'Gauteng'
};

const validation = validateAddressForm(sampleForm);
console.log(`Form validation result: ${validation.valid ? 'Valid' : 'Invalid'}`);
if (!validation.valid) {
    console.log(`Errors: ${validation.errors.join(', ')}`);
}

console.log('\nScenario B: Address Autocomplete');
console.log('For postal code 0001, suggested province: Gauteng');
console.log('For province "GP", full name: Gauteng (GP)');

console.log('\n=== End of Examples ===');

// Export examples for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateAddressForm,
        testPostalCodes,
        testProvinces,
        testAddresses
    };
}