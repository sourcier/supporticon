export const currencyCode = (country = 'UK') => {
  switch (country.toLowerCase()) {
    case 'au':
      return 'AUD'
    case 'us':
      return 'USD'
    case 'ie':
      return 'EUR'
    case 'sg':
      return 'SGD'
    case 'hk':
      return 'HKD'
    case 'ca':
      return 'CAD'
    case 'za':
      return 'ZAR'
    default:
      return 'GBP'
  }
}

export const currencySymbol = (code = 'GBP') => {
  switch (code.toLowerCase()) {
    case 'gbp':
      return '£'
    case 'hkd':
      return 'HK$'
    case 'aed':
      return 'د.إ'
    default:
      return '$'
  }
}
