/*
 * South African Postal Code Validation
 * Part of the SA Address Utils library
 * Copyright (c) 2025 SA Address Utils
 */

// SA postal code ranges by province
const POSTAL_CODE_RANGES = {
    'western-cape': { min: 6500, max: 8999 },
    'eastern-cape': { min: 5200, max: 6499 },
    'northern-cape': { min: 8200, max: 8999 },
    'free-state': { min: 9300, max: 9999 },
    'kwazulu-natal': { min: 3200, max: 4999 },
    'north-west': { min: 2500, max: 2999 },
    'gauteng': { min: 1500, max: 2199 },
    'mpumalanga': { min: 1200, max: 1499 },
    'limpopo': { min: 700, max: 1199 }
};

// Major city postal codes
const MAJOR_CITIES = {
    'johannesburg': [2000, 2001, 2002, 2092, 2094, 2196],
    'cape-town': [8000, 8001, 8002, 8005, 8018],
    'durban': [4000, 4001, 4013, 4051, 4091],
    'pretoria': [0001, 0002, 0007, 0028, 0081, 0083, 0084, 0087],
    'port-elizabeth': [6000, 6001, 6006, 6013, 6020],
    'bloemfontein': [9300, 9301, 9306, 9320],
    'east-london': [5200, 5201, 5205, 5213, 5241],
    'pietermaritzburg': [3200, 3201, 3206, 3216],
    'nelspruit': [1200, 1201, 1206, 1210],
    'polokwane': [700, 701, 699]
};

class PostalCodeValidator {
    
    static validate(postalCode) {
        if (!postalCode) return { valid: false, error: 'Postal code is required' };
        
        // Clean the postal code
        const cleaned = String(postalCode).replace(/\D/g, '');
        
        // Check length (SA postal codes are 4 digits)
        if (cleaned.length !== 4) {
            return { valid: false, error: 'SA postal codes must be 4 digits' };
        }
        
        const code = parseInt(cleaned);
        
        // Check if it's within any valid range
        for (const [province, range] of Object.entries(POSTAL_CODE_RANGES)) {
            if (code >= range.min && code <= range.max) {
                return {
                    valid: true,
                    code: cleaned,
                    province: province.replace('-', ' ').toUpperCase(),
                    region: this.getRegion(code)
                };
            }
        }
        
        return { valid: false, error: 'Invalid SA postal code range' };
    }
    
    static getRegion(code) {
        // Determine major city if applicable
        for (const [city, codes] of Object.entries(MAJOR_CITIES)) {
            if (codes.includes(code)) {
                return city.replace('-', ' ').toUpperCase();
            }
        }
        
        // Return province-based region
        if (code >= 1500 && code <= 2199) return 'GAUTENG REGION';
        if (code >= 1 && code <= 99) return 'PRETORIA CENTRAL';
        if (code >= 2000 && code <= 2199) return 'JOHANNESBURG REGION';
        if (code >= 8000 && code <= 8099) return 'CAPE TOWN REGION';
        if (code >= 4000 && code <= 4099) return 'DURBAN REGION';
        
        return 'RURAL AREA';
    }
    
    static getProvince(postalCode) {
        const result = this.validate(postalCode);
        return result.valid ? result.province : null;
    }
    
    static isValidForProvince(postalCode, province) {
        const result = this.validate(postalCode);
        if (!result.valid) return false;
        
        const normalizedProvince = province.toLowerCase().replace(/\s+/g, '-');
        return result.province.toLowerCase().replace(/\s+/g, '-') === normalizedProvince;
    }
    
    static suggestCorrection(invalidCode) {
        if (!invalidCode) return [];
        
        const cleaned = String(invalidCode).replace(/\D/g, '');
        if (cleaned.length !== 4) return [];
        
        const code = parseInt(cleaned);
        const suggestions = [];
        
        // Find nearest valid codes
        for (const [province, range] of Object.entries(POSTAL_CODE_RANGES)) {
            const distance = Math.min(
                Math.abs(code - range.min),
                Math.abs(code - range.max)
            );
            
            if (distance <= 100) {
                if (code < range.min) {
                    suggestions.push({
                        code: String(range.min).padStart(4, '0'),
                        province: province.replace('-', ' ').toUpperCase(),
                        reason: 'Nearest valid code'
                    });
                } else {
                    suggestions.push({
                        code: String(range.max).padStart(4, '0'),
                        province: province.replace('-', ' ').toUpperCase(),
                        reason: 'Nearest valid code'
                    });
                }
            }
        }
        
        return suggestions.slice(0, 3); // Return top 3 suggestions
    }
}

// Export for different module systems
if (typeof window !== 'undefined') {
    window.PostalCodeValidator = PostalCodeValidator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PostalCodeValidator;
}

if (typeof define === 'function' && define.amd) {
    define([], function() {
        return PostalCodeValidator;
    });
}