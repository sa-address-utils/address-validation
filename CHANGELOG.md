# Changelog

All notable changes to this project will be documented in this file.

## [1.2.4] - 2025-06-20

### Added
- Enhanced municipal boundary validation for Gauteng metros
- Improved address geocoding with better suburb recognition
- Added support for Tshwane metropolitan area boundaries

### Fixed
- Fixed postal code validation for Northern Cape ranges
- Improved error handling in address geocoder
- Better handling of special characters in street names

### Changed
- Updated suburb database with latest municipal data
- Optimized boundary checking algorithms

## [1.2.3] - 2025-05-15

### Added
- Ward boundary checking functionality
- Support for by-election boundary verification
- Enhanced Pretoria region coverage

### Fixed
- Fixed issue with province validation for alternative spellings
- Corrected postal code ranges for rural areas

## [1.2.2] - 2025-04-02

### Added
- Province validator with fuzzy matching
- Support for historical province names
- Better error messages and suggestions

### Changed
- Improved performance of postal code validation
- Updated documentation with more examples

## [1.2.1] - 2025-03-10

### Fixed
- Fixed postal code validation for KwaZulu-Natal
- Corrected street address formatting edge cases
- Better handling of abbreviated province names

## [1.2.0] - 2025-02-18

### Added
- Comprehensive postal code validation
- Province normalization and validation
- Street address formatting utilities
- Suburb database for major cities

### Changed
- Refactored core validation logic
- Improved module exports for different environments

## [1.1.0] - 2025-01-20

### Added
- Basic address validation functionality
- Support for South African postal codes
- Province validation with common aliases

### Fixed
- Improved error handling
- Better input sanitization

## [1.0.0] - 2024-12-01

### Added
- Initial release
- Basic postal code validation
- Province name normalization
- Core address utilities

### Security
- Added input validation and sanitization
- Implemented proper error handling