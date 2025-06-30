'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { 
  niveauScolaireOptions, 
  orgStatusOptions, 
  ageOptions, 
  mapArabicToBoolean,
  validateAge,
  validateRequired,
  validateEmail
} from '../../lib/formHelpers'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    email: '',
    phoneNumber: '',
    age: '',
    
    // Educational Information
    niveau_scolaire: '',
    school: '',
    
    // Organization Information
    org_status: '',
    previous_camps: '',
    can_pay_350dh: '',
    
    // Additional Information
    camp_expectation: '',
    extraInfo: '',
    photo: null
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScoring, setIsScoring] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [scoringStatus, setScoringStatus] = useState('')

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
    // Basic Information
    if (!validateRequired(formData.fullName)) {
      setError('الاسم الكامل مطلوب')
      return false
    }
    if (!validateRequired(formData.email)) {
      setError('البريد الإلكتروني مطلوب')
      return false
    }
    if (!validateEmail(formData.email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح')
      return false
    }
    if (!validateRequired(formData.phoneNumber)) {
      setError('رقم الهاتف مطلوب')
      return false
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setError('يرجى إدخال رقم هاتف مغربي صحيح (مثال: +212 6 12 34 56 78 أو 0612345678)')
      return false
    }
    if (!validateRequired(formData.age)) {
      setError('العمر مطلوب')
      return false
    }
    if (!validateAge(formData.age)) {
      setError('العمر يجب أن يكون بين 17 و 26 سنة')
      return false
    }
    
    // Educational Information
    if (!validateRequired(formData.niveau_scolaire)) {
      setError('المستوى الدراسي مطلوب')
      return false
    }
    if (!validateRequired(formData.school)) {
      setError('اسم المدرسة مطلوب')
      return false
    }
    
    // Organization Information
    if (!validateRequired(formData.org_status)) {
      setError('الحالة التنظيمية مطلوبة')
      return false
    }
    if (!validateRequired(formData.previous_camps)) {
      setError('معلومات المخيمات السابقة مطلوبة')
      return false
    }
    if (!validateRequired(formData.can_pay_350dh)) {
      setError('معلومات القدرة على الدفع مطلوبة')
      return false
    }
    
    // Additional Information
    if (!validateRequired(formData.camp_expectation)) {
      setError('توقعات المخيم مطلوبة')
      return false
    }
    if (!validateRequired(formData.extraInfo)) {
      setError('المعلومات الإضافية مطلوبة')
      return false
    }
    if (!formData.photo) {
      setError('الصورة الشخصية مطلوبة')
      return false
    }
    return true
  }

  const resetForm = () => {
    setFormData({
      // Basic Information
      fullName: '',
      email: '',
      phoneNumber: '',
      age: '',
      
      // Educational Information
      niveau_scolaire: '',
      school: '',
      
      // Organization Information
      org_status: '',
      previous_camps: '',
      can_pay_350dh: '',
      
      // Additional Information
      camp_expectation: '',
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
            age: parseInt(formData.age),
            niveau_scolaire: formData.niveau_scolaire,
            school: formData.school,
            org_status: formData.org_status,
            previous_camps: mapArabicToBoolean(formData.previous_camps),
            can_pay_350dh: mapArabicToBoolean(formData.can_pay_350dh),
            camp_expectation: formData.camp_expectation,
            extra_info: formData.extraInfo,
            photo_url: urlData.publicUrl,
            status: 'new'
          }
        ])
        .select()

      if (insertError) {
        throw new Error(`Failed to save registration: ${insertError.message}`)
      }

      const registrationId = insertData[0].id

      // Start scoring process
      setIsScoring(true)
      setScoringStatus('جاري تقييم البيانات بالذكاء الاصطناعي...')

      try {
        // Call scoring API
        const scoringResponse = await fetch('/api/score-participant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            age: parseInt(formData.age),
            niveau_scolaire: formData.niveau_scolaire,
            school: formData.school,
            org_status: formData.org_status,
            previous_camps: mapArabicToBoolean(formData.previous_camps),
            can_pay_350dh: mapArabicToBoolean(formData.can_pay_350dh),
            camp_expectation: formData.camp_expectation,
            extra_info: formData.extraInfo
          })
        })

        if (!scoringResponse.ok) {
          throw new Error('Failed to score participant')
        }

        const scoringResult = await scoringResponse.json()

        if (scoringResult.success) {
          // Update registration with score
          const { error: updateError } = await supabase
            .from('registrations')
            .update({
              score: scoringResult.score,
              score_explanation: scoringResult.score_explanation
            })
            .eq('id', registrationId)

          if (updateError) {
            console.error('Failed to update score:', updateError)
            setScoringStatus('تم حفظ التسجيل بنجاح ولكن فشل في حفظ التقييم')
          } else {
            setScoringStatus('تم التقييم وحفظ البيانات بنجاح!')
          }
        } else {
          setScoringStatus('تم حفظ التسجيل بنجاح ولكن فشل في التقييم')
        }
      } catch (scoringError) {
        console.error('Scoring failed:', scoringError)
        setScoringStatus('تم حفظ التسجيل بنجاح ولكن فشل في التقييم')
      } finally {
        setIsScoring(false)
      }

      // Show success message and reset form
      setShowSuccess(true)
      resetForm()
      
      // Hide success message after 8 seconds (longer to show scoring status)
      setTimeout(() => {
        setShowSuccess(false)
        setScoringStatus('')
      }, 8000)

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
            <div className="mb-2">شكرًا لانضمامك للملتقى الصيفي! سنتواصل معك قريبًا لمزيد من التفاصيل.</div>
            {scoringStatus && (
              <div className="text-sm mt-2 p-2 bg-white bg-opacity-50 rounded">
                <span className="mr-2">🤖</span>
                {scoringStatus}
              </div>
            )}
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
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-brand-100 text-brand-700 rounded-full p-2 mr-3">👤</span>
                المعلومات الأساسية
              </h3>
              <div className="space-y-4">
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

                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-900 mb-2">
                    العمر *
                  </label>
                  <select
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors text-gray-900"
                  >
                    <option value="">اختر عمرك</option>
                    {ageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} سنة
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Educational Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-700 rounded-full p-2 mr-3">🎓</span>
                المعلومات الدراسية
              </h3>
              <div className="space-y-4">
                {/* Educational Level */}
                <div>
                  <label htmlFor="niveau_scolaire" className="block text-sm font-medium text-gray-900 mb-2">
                    المستوى الدراسي *
                  </label>
                  <select
                    id="niveau_scolaire"
                    name="niveau_scolaire"
                    value={formData.niveau_scolaire}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors text-gray-900"
                  >
                    <option value="">اختر مستواك الدراسي</option>
                    {niveauScolaireOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* School */}
                <div>
                  <label htmlFor="school" className="block text-sm font-medium text-gray-900 mb-2">
                    اسم المؤسسة التعليمية *
                  </label>
                  <input
                    type="text"
                    id="school"
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900"
                    placeholder="أدخل اسم مدرستك أو جامعتك"
                  />
                </div>
              </div>
            </div>

            {/* Organization Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-green-100 text-green-700 rounded-full p-2 mr-3">🏢</span>
                المعلومات التنظيمية
              </h3>
              <div className="space-y-4">
                {/* Organization Status */}
                <div>
                  <label htmlFor="org_status" className="block text-sm font-medium text-gray-900 mb-2">
                    الحالة التنظيمية *
                  </label>
                  <select
                    id="org_status"
                    name="org_status"
                    value={formData.org_status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors text-gray-900"
                  >
                    <option value="">اختر حالتك التنظيمية</option>
                    {orgStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                                         {/* Previous Camps - Radio buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    هل شاركت في مخيمات سابقة؟ *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="previous_camps"
                        value="نعم"
                        checked={formData.previous_camps === 'نعم'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                      />
                      <span className="mr-2 text-gray-900">نعم</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="previous_camps"
                        value="لا"
                        checked={formData.previous_camps === 'لا'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                      />
                      <span className="mr-2 text-gray-900">لا</span>
                    </label>
                  </div>
                </div>

                {/* Can Pay 350dh - Radio buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    هل يمكنك دفع 350 درهم؟ *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="can_pay_350dh"
                        value="نعم"
                        checked={formData.can_pay_350dh === 'نعم'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                      />
                      <span className="mr-2 text-gray-900">نعم</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="can_pay_350dh"
                        value="لا"
                        checked={formData.can_pay_350dh === 'لا'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                      />
                      <span className="mr-2 text-gray-900">لا</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-700 rounded-full p-2 mr-3">💬</span>
                معلومات إضافية
              </h3>
              <div className="space-y-4">
                {/* Camp Expectation */}
                <div>
                  <label htmlFor="camp_expectation" className="block text-sm font-medium text-gray-900 mb-2">
                    ماذا تتوقع من هذا المخيم؟ *
                  </label>
                  <textarea
                    id="camp_expectation"
                    name="camp_expectation"
                    value={formData.camp_expectation}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none placeholder-gray-600 text-gray-900"
                    placeholder="أخبرنا عن توقعاتك وأهدافك من المشاركة في هذا المخيم..."
                  />
                </div>

                {/* Extra Info */}
                <div>
                  <label htmlFor="extraInfo" className="block text-sm font-medium text-gray-900 mb-2">
                    معلومات صحية أو طلبات خاصة *
                  </label>
                  <textarea
                    id="extraInfo"
                    name="extraInfo"
                    value={formData.extraInfo}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none placeholder-gray-600 text-gray-900"
                    placeholder="أخبرنا عن أي معلومات صحية، حساسية، أو طلبات خاصة..."
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-100 text-orange-700 rounded-full p-2 mr-3">📷</span>
                الصورة الشخصية
              </h3>
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isScoring}
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
              ) : isScoring ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري تقييم البيانات...
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