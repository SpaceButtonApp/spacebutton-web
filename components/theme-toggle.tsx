'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-secondary animate-pulse" />
    )
  }

  const themeOptions = [
    { value: 'light', label: 'Light Mode', icon: Sun },
    { value: 'dark', label: 'Dark Mode', icon: Moon },
    { value: 'system', label: 'System Default', icon: Monitor },
  ]

  const currentTheme = themeOptions.find(opt => opt.value === theme)
  const CurrentIcon = currentTheme?.icon || Sun

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
        title="Theme settings"
      >
        <CurrentIcon className="w-5 h-5 text-primary" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-12 bg-background border border-border rounded-lg overflow-hidden shadow-lg z-50 min-w-40">
          {themeOptions.map((option) => {
            const OptionIcon = option.icon
            const isSelected = theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value)
                  setShowMenu(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary transition-colors ${
                  isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                }`}
              >
                <OptionIcon className="w-4 h-4" />
                <span>{option.label}</span>
                {isSelected && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
