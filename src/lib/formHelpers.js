/**
 * Helper functions for form data mapping and validation
 * Purpose: Provides validation logic and options for registration form
 * Updated: Extended age range from 14-26 years old
 */

// Mapping functions for dropdown/select values
export const niveauScolaireOptions = [
  { value: 'الثانوي التأهيلي', label: 'الثانوي التأهيلي' },
  { value: 'الإجازة', label: 'الإجازة' },
  { value: 'الماستر', label: 'الماستر' },
  { value: 'اخر', label: 'اخر' }
]

export const orgStatusOptions = [
  { value: 'عضو(ة)', label: 'عضو(ة)' },
  { value: 'منخرط(ة)', label: 'منخرط(ة)' },
  { value: 'متعاطف(ة)', label: 'متعاطف(ة)' }
]

// Age options (14-26)
export const ageOptions = Array.from({ length: 13 }, (_, i) => ({
  value: i + 14,
  label: (i + 14).toString()
}))

// Boolean mapping for Arabic radio buttons
export const mapArabicToBoolean = (arabicValue) => {
  switch (arabicValue) {
    case 'نعم':
      return true
    case 'لا':
      return false
    default:
      return null
  }
}

export const mapBooleanToArabic = (booleanValue) => {
  if (booleanValue === true) return 'نعم'
  if (booleanValue === false) return 'لا'
  return ''
}

// Display helpers for admin dashboard
export const getArabicStatusDisplay = (status) => {
  const statusMap = {
    new: 'جديد',
    pending: 'قيد المراجعة', 
    approved: 'مقبول',
    declined: 'مرفوض'
  }
  return statusMap[status] || status
}

// Validation helpers
export const validateAge = (age) => {
  const numAge = parseInt(age)
  return numAge >= 14 && numAge <= 26
}

export const validateRequired = (value) => {
  return value && value.toString().trim() !== ''
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
} 