/**
 * Returns the default department settings (enabled on signup) for a given property type.
 * @param {string} type
 * @returns {string[]}
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
    case 'hostel':
      return ['Reception', 'Housekeeping', 'Security'];
    case 'bnb':
    case 'bed-and-breakfast':
      return ['Housekeeping', 'Front Desk', 'Breakfast Service'];
    default:
      return ['General'];
  }
}

/**
 * Returns the full list of available departments for a given property type,
 * regardless of what's enabled by default.
 * @param {string} type
 * @returns {string[]}
 */
export function getDepartmentsFor(type) {
  switch (type) {
    case 'hotel':
      return [
        'Housekeeping', 'Maintenance', 'Front Desk', 'Room Service', 'Valet',
        'Concierge', 'Security', 'Events', 'Spa', 'IT', 'Management', 'Bellhop',
        'Laundry', 'Reservations', 'Food & Beverage'
      ];
    case 'apartment':
      return [
        'Maintenance', 'Leasing', 'Security', 'Concierge', 'Janitorial',
        'Resident Services', 'Parking', 'Mailroom', 'Landscaping', 'Management'
      ];
    case 'condo':
      return [
        'Maintenance', 'Concierge', 'Security', 'HOA', 'Janitorial',
        'Parking', 'Trash Services', 'Resident Services', 'Landscaping'
      ];
    case 'restaurant':
      return [
        'Kitchen', 'Waitstaff', 'Management', 'Host/Hostess', 'Bar',
        'Cleaning', 'Delivery', 'Inventory', 'Reservations', 'Dishwashing'
      ];
    default:
      return ['General'];
  }
}
