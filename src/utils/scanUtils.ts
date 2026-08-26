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
    
    // Check old format (with hyphens): NIS-DD-MM-YYYY-XYZ
    if (/(-\d{2}-\d{2}-\d{4}-[A-Z0-9]{3})$/i.test(trimmed)) {
        return trimmed.replace(/(-\d{2}-\d{2}-\d{4}-[A-Z0-9]{3})$/i, '');
    }
    
    // Check new format (without hyphens): NIS + DDMMYYYY + XYZ
    // We enforce that the NIS part must be at least 4 digits to prevent 
    // accidentally matching a manually typed 11-digit NIS as the suffix.
    const newFormatMatch = trimmed.match(/^(\d{4,})(\d{8}[A-Z0-9]{3})$/i);
    if (newFormatMatch) {
        return newFormatMatch[1];
    }
    
    // If it doesn't match known barcode formats, return it as is (manual input).
    // Do not return `trimmed` here, otherwise trailing spaces will be lost during typing.
    return scannedValue;
};
