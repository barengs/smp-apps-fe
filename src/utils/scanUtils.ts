/**
 * Utilities for barcode and card scanning
 */

/**
 * Extracts NIS from a scanned card number.
 * Supports both old format (with hyphens) and new format (without hyphens).
 * 
 * Old format example: 14450197049-16-08-2026-TIT -> 14450197049
 * New format example: 1445019704916082026TIT -> 14450197049
 * Manual NIS example: 14450197049 -> 14450197049
 */
export const extractNisFromScan = (scannedValue: string): string => {
    if (!scannedValue) return '';
    const trimmed = scannedValue.trim();
    // Matches suffix: -DD-MM-YYYY-XYZ (15 chars) or DDMMYYYYXYZ (11 chars) where XYZ is alphanumeric
    return trimmed.replace(/(-\d{2}-\d{2}-\d{4}-[A-Z0-9]{3}|\d{8}[A-Z0-9]{3})$/i, '');
};
