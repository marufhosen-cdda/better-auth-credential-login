"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { hexToOklch, getContrastColor } from '@/lib/theme-utils'

interface ThemeConfig {
    colors: {
        primary: string
        // Add more colors as needed
    }
    radius: string
}

interface ThemeContextType {
    isDark: boolean
    toggleTheme: () => void
    config: ThemeConfig
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
    children: ReactNode
    config: ThemeConfig
}

export function ThemeProvider({ children, config }: ThemeProviderProps) {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Check if user has a preference stored
        const stored = localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        const shouldBeDark = stored === 'dark' || (!stored && prefersDark)
        setIsDark(shouldBeDark)

        // Apply theme immediately
        applyTheme(shouldBeDark, config)

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                setIsDark(e.matches)
                applyTheme(e.matches, config)
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [config])

    const applyTheme = (dark: boolean, themeConfig: ThemeConfig) => {
        const root = document.documentElement

        if (dark) {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        // Apply custom colors and radius
        const primaryOklch = hexToOklch(themeConfig.colors.primary)
        const primaryForeground = getContrastColor(themeConfig.colors.primary)

        root.style.setProperty('--primary', primaryOklch)
        root.style.setProperty('--primary-foreground', primaryForeground)
        root.style.setProperty('--radius', themeConfig.radius)
    }

    const toggleTheme = () => {
        const newTheme = !isDark
        setIsDark(newTheme)
        applyTheme(newTheme, config)
        localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    }

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, config }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}