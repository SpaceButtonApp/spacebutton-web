'use client'

import { useState, useEffect, useRef } from 'react'
import { AdminHeader } from '@/components/admin-v2/header'
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Eye,
  EyeOff,
  Save,
  Check,
  Camera,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'demo@admin.com',
    phone: '+234 800 000 0000',
    role: 'Super Admin',
    avatar: ''
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [passwordErrors, setPasswordErrors] = useState({
    current: '',
    confirm: ''
  })

  const [notifications, setNotifications] = useState({
    newUsers: true,
    newListings: true,
    transactions: true,
    reviews: false,
    systemAlerts: true,
    emailDigest: false
  })

  // Load profile from localStorage
  useEffect(() => {
    const auth = localStorage.getItem('admin-v2-auth')
    if (auth) {
      const data = JSON.parse(auth)
      setProfile(prev => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        role: data.role || prev.role,
        avatar: data.avatar || prev.avatar
      }))
    }
    
    // Load notification preferences
    const notifPrefs = localStorage.getItem('admin-notifications')
    if (notifPrefs) {
      setNotifications(JSON.parse(notifPrefs))
    }
  }, [])

  // Handle photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setProfile(prev => ({ ...prev, avatar: base64 }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Save profile changes
  const handleSaveProfile = () => {
    const auth = localStorage.getItem('admin-v2-auth')
    const existingData = auth ? JSON.parse(auth) : {}
    
    const updatedAuth = {
      ...existingData,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      avatar: profile.avatar
    }
    
    localStorage.setItem('admin-v2-auth', JSON.stringify(updatedAuth))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Validate and update password
  const handleUpdatePassword = () => {
    setPasswordErrors({ current: '', confirm: '' })
    
    // Check if current password matches (demo password is 'admin123')
    const auth = localStorage.getItem('admin-v2-auth')
    const currentPassword = auth ? JSON.parse(auth).password || 'admin123' : 'admin123'
    
    if (passwords.current !== currentPassword) {
      setPasswordErrors(prev => ({ ...prev, current: 'Current password does not match' }))
      return
    }
    
    // Check if new passwords match
    if (passwords.new !== passwords.confirm) {
      setPasswordErrors(prev => ({ ...prev, confirm: 'New passwords do not match' }))
      return
    }
    
    // Check minimum length
    if (passwords.new.length < 6) {
      setPasswordErrors(prev => ({ ...prev, confirm: 'Password must be at least 6 characters' }))
      return
    }
    
    // Save new password
    const existingAuth = auth ? JSON.parse(auth) : {}
    localStorage.setItem('admin-v2-auth', JSON.stringify({
      ...existingAuth,
      password: passwords.new
    }))
    
    setPasswords({ current: '', new: '', confirm: '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Save notification preferences
  const handleSaveNotifications = () => {
    localStorage.setItem('admin-notifications', JSON.stringify(notifications))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="min-h-screen">
      <AdminHeader title="Settings" />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-[#12121a] rounded-xl border border-gray-800/50 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Profile Information</h3>
                <p className="text-sm text-gray-400">Update your account profile details</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative">
                  {profile.avatar ? (
                    <Image 
                      src={profile.avatar} 
                      alt={profile.name} 
                      width={80} 
                      height={80} 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Change Photo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Change Password</h3>
                <p className="text-sm text-gray-400">Update your password to keep your account secure</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => {
                        setPasswords({ ...passwords, current: e.target.value })
                        setPasswordErrors(prev => ({ ...prev, current: '' }))
                      }}
                      className={`w-full px-4 py-3 bg-[#1a1a24] border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 pr-12 ${
                        passwordErrors.current ? 'border-red-500' : 'border-gray-800'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.current && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordErrors.current}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => {
                      setPasswords({ ...passwords, confirm: e.target.value })
                      setPasswordErrors(prev => ({ ...prev, confirm: '' }))
                    }}
                    className={`w-full px-4 py-3 bg-[#1a1a24] border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 ${
                      passwordErrors.confirm ? 'border-red-500' : 'border-gray-800'
                    }`}
                  />
                  {passwordErrors.confirm && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordErrors.confirm}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleUpdatePassword}
                  disabled={!passwords.current || !passwords.new || !passwords.confirm}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {saved ? 'Updated!' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Notification Preferences</h3>
                <p className="text-sm text-gray-400">Choose what notifications you want to receive</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'newUsers', label: 'New User Registrations', desc: 'Get notified when a new user signs up' },
                  { key: 'newListings', label: 'New Listings', desc: 'Get notified when a new property is listed' },
                  { key: 'transactions', label: 'Transactions', desc: 'Get notified about payment transactions' },
                  { key: 'reviews', label: 'New Reviews', desc: 'Get notified when users leave reviews' },
                  { key: 'systemAlerts', label: 'System Alerts', desc: 'Important system notifications and alerts' },
                  { key: 'emailDigest', label: 'Email Digest', desc: 'Receive a daily summary via email' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-xl">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-purple-600' : 'bg-gray-700'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSaveNotifications}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
