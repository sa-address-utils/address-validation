/*
 * South African Province Validation
 * Part of the SA Address Utils library
 * Copyright (c) 2025 SA Address Utils
 */

const SA_PROVINCES = {
    'western-cape': {
        name: 'Western Cape',
        capital: 'Cape Town',
        code: 'WC',
        aliases: ['western cape', 'west cape', 'wc', 'cape town province']
    },
    'eastern-cape': {
        name: 'Eastern Cape',
        capital: 'Bhisho',
        code: 'EC',
        aliases: ['eastern cape', 'east cape', 'ec']
    },
    'northern-cape': {
        name: 'Northern Cape',
        capital: 'Kimberley',
        code: 'NC',
        aliases: ['northern cape', 'north cape', 'nc']
    },
    'free-state': {
        name: 'Free State',
        capital: 'Bloemfontein',
        code: 'FS',
        aliases: ['free state', 'freestate', 'fs', 'orange free state']
    },
    'kwazulu-natal': {
        name: 'KwaZulu-Natal',
        capital: 'Pietermaritzburg',
        code: 'KZN',
        aliases: ['kwazulu natal', 'kwazulu-natal', 'kzn', 'natal', 'zulu natal']
    },
    'north-west': {
        name: 'North West',
        capital: 'Mahikeng',
        code: 'NW',
        aliases: ['north west', 'northwest', 'nw', 'north-west']
    },
    'gauteng': {
        name: 'Gauteng',
        capital: 'Johannesburg',
        code: 'GP',
        aliases: ['gauteng', 'gp', 'pwv', 'pretoria-witwatersrand-vereeniging']
    },
    'mpumalanga': {
        name: 'Mpumalanga',
        capital: 'Nelspruit',
        code: 'MP',
        aliases: ['mpumalanga', 'mp', 'eastern transvaal']
    },
    'limpopo': {
        name: 'Limpopo',
        capital: 'Polokwane',
        code: 'LP',
        aliases: ['limpopo', 'lp', 'northern province', 'northern transvaal']
    }
};

class ProvinceValidator {
    
    static getProvinces() {
        return Object.values(SA_PROVINCES).map(p => ({
            name: p.name,
            capital: p.capital,
            code: p.code
        }));
    }
    
    static validate(province) {
        if (!province) return { valid: false, error: 'Province is required' };
        
        const normalized = String(province).toLowerCase().trim();
        
        // Check direct match or aliases
        for (const [key, data] of Object.entries(SA_PROVINCES)) {
            if (key === normalized || 
                data.name.toLowerCase() === normalized ||
                data.code.toLowerCase() === normalized ||
                data.aliases.includes(normalized)) {
                
                return {
                    valid: true,
                    province: data.name,
                    capital: data.capital,
                    code: data.code,
                    key: key
                };
            }
        }
        
        // Fuzzy matching for common misspellings
        const suggestions = this.getSuggestions(normalized);
        
        return {
            valid: false,
            error: 'Invalid SA province',
            suggestions: suggestions
        };
    }
    
    static getSuggestions(input) {
        const suggestions = [];
        const inputLower = input.toLowerCase();
        
        for (const [key, data] of Object.entries(SA_PROVINCES)) {
            // Check if input is contained in province name
            if (data.name.toLowerCase().includes(inputLower) ||
                inputLower.includes(data.name.toLowerCase().split(' ')[0])) {
                suggestions.push(data.name);
            }
            
            // Check aliases
            for (const alias of data.aliases) {
                if (alias.includes(inputLower) || inputLower.includes(alias)) {
                    if (!suggestions.includes(data.name)) {
                        suggestions.push(data.name);
                    }
                }
            }
        }
        
        return suggestions.slice(0, 3);
    }
    
    static getByCode(code) {
        if (!code) return null;
        
        const normalized = String(code).toUpperCase().trim();
        
        for (const data of Object.values(SA_PROVINCES)) {
            if (data.code === normalized) {
                return {
                    name: data.name,
                    capital: data.capital,
                    code: data.code
                };
            }
        }
        
        return null;
    }
    
    static isValidProvince(province) {
        return this.validate(province).valid;
    }
    
    static normalizeProvinceName(province) {
        const result = this.validate(province);
        return result.valid ? result.province : null;
    }
    
    static getProvinceCodes() {
        return Object.values(SA_PROVINCES).map(p => p.code);
    }
    
    static getProvinceNames() {
        return Object.values(SA_PROVINCES).map(p => p.name);
    }
}

// Export for different module systems
if (typeof window !== 'undefined') {
    window.ProvinceValidator = ProvinceValidator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProvinceValidator;
}

if (typeof define === 'function' && define.amd) {
    define([], function() {
        return ProvinceValidator;
    });
}