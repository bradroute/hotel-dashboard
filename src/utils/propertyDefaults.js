// src/utils/propertyDefaults.js

/**
 * Returns the default department settings for a given property type.
 * @param {string} type - The type of property (e.g., 'hotel', 'apartment', 'condo', 'restaurant').
 * @returns {string[]} An array of department names to seed for the property.
 */
export function getDefaultsFor(type) {
  switch (type) {
    case 'hotel':
      return ['Housekeeping', 'Maintenance', 'Front Desk', 'Room Service', 'Valet'];
    case 'apartment':
      return ['Maintenance', 'Leasing', 'Security'];
    case 'condo':
      return ['Maintenance', 'Concierge', 'Security'];
    case 'restaurant':
      return ['Kitchen', 'Waitstaff', 'Management'];
    // Add more property types as needed:
    case 'hostel':
      return ['Reception', 'Housekeeping', 'Security'];
    case 'bnb':
    case 'bed-and-breakfast':
      return ['Housekeeping', 'Front Desk', 'Breakfast Service'];
    default:
      return ['General'];
  }
}
