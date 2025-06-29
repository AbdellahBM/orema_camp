'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    extraInfo: '',
    photo: null
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)

  const validatePhoneNumber = (phone) => {
    // Remove all spaces, dashes, and parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    
    // Check if it's a valid Moroccan phone number
    // Formats accepted:
    // +212XXXXXXXXX (country code + 9 digits)
    // 212XXXXXXXXX (country code + 9 digits)  
    // 0XXXXXXXXX (10 digits starting with 0)
    // XXXXXXXXX (9 digits)
    
    const moroccanMobileRegex = /^(\+212|212|0)?[67]\d{8}$/
    const moroccanLandlineRegex = /^(\+212|212|0)?5\d{8}$/
    
    return moroccanMobileRegex.test(cleanPhone) || moroccanLandlineRegex.test(cleanPhone)
  }

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '')
    
    // If starts with +212, format as +212 X XX XX XX XX
    if (cleaned.startsWith('+212')) {
      const number = cleaned.slice(4)
      if (number.length <= 9) {
        return '+212 ' + number.replace(/(\d{1})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/, (match, p1, p2, p3, p4, p5) => {
          let result = p1
          if (p2) result += ' ' + p2
          if (p3) result += ' ' + p3
          if (p4) result += ' ' + p4
          if (p5) result += ' ' + p5
          return result
        }).trim()
      }
    }
    // If starts with 212, format as 212 X XX XX XX XX
    else if (cleaned.startsWith('212')) {
      const number = cleaned.slice(3)
      if (number.length <= 9) {
        return '212 ' + number.replace(/(\d{1})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/, (match, p1, p2, p3, p4, p5) => {
          let result = p1
          if (p2) result += ' ' + p2
          if (p3) result += ' ' + p3
          if (p4) result += ' ' + p4
          if (p5) result += ' ' + p5
          return result
        }).trim()
      }
    }
    // If starts with 0, format as 0X XX XX XX XX
    else if (cleaned.startsWith('0')) {
      if (cleaned.length <= 10) {
        return cleaned.replace(/(\d{2})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/, (match, p1, p2, p3, p4, p5) => {
          let result = p1
          if (p2) result += ' ' + p2
          if (p3) result += ' ' + p3
          if (p4) result += ' ' + p4
          if (p5) result += ' ' + p5
          return result
        }).trim()
      }
    }
    // If no country code, format as X XX XX XX XX
    else {
      if (cleaned.length <= 9) {
        return cleaned.replace(/(\d{1})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/, (match, p1, p2, p3, p4, p5) => {
          let result = p1
          if (p2) result += ' ' + p2
          if (p3) result += ' ' + p3
          if (p4) result += ' ' + p4
          if (p5) result += ' ' + p5
          return result
        }).trim()
      }
    }
    
    return cleaned
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    let processedValue = value
    
    // Special handling for phone number
    if (name === 'phoneNumber') {
      processedValue = formatPhoneNumber(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
    
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB')
        return
      }

      setFormData(prev => ({
        ...prev,
        photo: file
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
      
      if (error) setError('')
    }
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.phoneNumber.trim()) {
      setError('رقم الهاتف مطلوب')
      return false
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setError('يرجى إدخال رقم هاتف مغربي صحيح (مثال: +212 6 12 34 56 78 أو 0612345678)')
      return false
    }
    if (!formData.extraInfo.trim()) {
      setError('Additional information is required')
      return false
    }
    if (!formData.photo) {
      setError('Photo is required')
      return false
    }
    return true
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      extraInfo: '',
      photo: null
    })
    setPhotoPreview(null)
    // Reset file input
    const fileInput = document.getElementById('photo')
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setError('')

    try {
      // Upload photo to Supabase Storage
      const fileExt = formData.photo.name.split('.').pop().toLowerCase()
      // Validate file extension
      const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      if (!allowedExts.includes(fileExt)) {
        throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.')
      }
      
      // Generate safe filename with only alphanumeric characters and hyphens
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const fileName = `camp-registration-${timestamp}-${randomString}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('registration-photos')
        .upload(fileName, formData.photo)

      if (uploadError) {
        throw new Error(`Failed to upload photo: ${uploadError.message}`)
      }

      // Get public URL of uploaded photo
      const { data: urlData } = supabase.storage
        .from('registration-photos')
        .getPublicUrl(fileName)

      // Insert registration data into database
      const { data: insertData, error: insertError } = await supabase
        .from('registrations')
        .insert([
          {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phoneNumber,
            extra_info: formData.extraInfo,
            photo_url: urlData.publicUrl,
            status: 'new'
          }
        ])

      if (insertError) {
        throw new Error(`Failed to save registration: ${insertError.message}`)
      }

      // Show success message and reset form
      setShowSuccess(true)
      resetForm()
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)

    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br-brand" dir="rtl" lang="ar">
      {/* Hero Section (like home page, but for registration) */}
      <section className="relative overflow-hidden pt-24 pb-12" style={{ 
        background: 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 25%, #F0F8FF 50%, #FFF8DC 75%, #F4A460 100%)',
        backgroundSize: '200% 200%',
        animation: 'beachWave 8s ease-in-out infinite'
      }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-extrabold text-brand-600 mb-2 tracking-tight leading-tight">استمارة التسجيل في الملتقى الصيفي</h1>
            <div className="text-lg text-gray-900 font-semibold mb-2">انضم إلينا في مغامرة صيفية لا تُنسى!</div>
          </div>
          <div className="text-center mt-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-secondary-500/20 rounded-2xl blur-xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
              <div className="relative text-xl md:text-2xl text-secondary-900 font-bold bg-white/90 backdrop-blur-sm rounded-2xl inline-block px-8 py-4 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <span className="relative z-10">سارع بالتسجيل، المقاعد محدودة!</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background number with gold gradient */}
        <div 
          className="absolute left-40 top-1/2 -translate-y-1/2 text-[14rem] md:text-[22rem] font-extrabold select-none pointer-events-none z-0"
          style={{ 
            background: 'linear-gradient(90deg, #FFD700 0%, #FFC300 40%, #FFB300 70%, #FF8F00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: 0.3
          }}
        >15</div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-brand-100 border border-brand-400 text-brand-700 rounded-lg">
            <div className="font-semibold mb-1">تم التسجيل بنجاح!</div>
            <div>شكرًا لانضمامك للملتقى الصيفي! سنتواصل معك قريبًا لمزيد من التفاصيل.</div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                الاسم الكامل *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900"
                placeholder="أدخل اسمك الكامل"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900 mb-2">
                رقم الهاتف *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900"
                placeholder="أدخل رقم هاتفك"
                dir="ltr"
              />
              <p className="text-sm text-gray-700 mt-1">
                أدخل رقم هاتف مغربي صحيح (موبايل: 06/07، ثابت: 05) مع أو بدون رمز البلد +212
              </p>
            </div>

            {/* Extra Info */}
            <div>
              <label htmlFor="extraInfo" className="block text-sm font-medium text-gray-900 mb-2">
                معلومات إضافية *
              </label>
              <textarea
                id="extraInfo"
                name="extraInfo"
                value={formData.extraInfo}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none placeholder-gray-600 text-gray-900"
                placeholder="أخبرنا عن أي معلومات صحية أو طلبات خاصة..."
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-900 mb-2">
                صورة شخصية *
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                
                {photoPreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-900 mb-2">معاينة الصورة:</p>
                    <img
                      src={photoPreview}
                      alt="Photo preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-1">
                يرجى رفع صورة واضحة (5MB كحد أقصى، بصيغة JPG أو PNG)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r-brand text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري إرسال التسجيل...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🏕️</span>
                  سجل في الملتقى الصيفي
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🌲</span>
              <h3 className="text-lg font-semibold text-gray-800">أنشطة المخيم</h3>
            </div>
            <p className="text-gray-800">رحلات مشي، سباحة، سهرات نار، ورشات يدوية، والمزيد من المغامرات!</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">📞</span>
              <h3 className="text-lg font-semibold text-gray-800">تحتاج مساعدة؟</h3>
            </div>
            <p className="text-gray-800">لديك استفسار حول التسجيل؟ تواصل معنا عبر info@orema.ma أو اتصل على 0600 000 000</p>
          </div>
        </div>
      </div>
    </div>
  )
} 