"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { hexToOklch, getContrastColor } from '@/lib/theme-utils'

interface ThemeConfig {
    colors: {
        primary: string
    }
    radius: string
}

interface ThemeContextType {
    isDark: boolean
    config: ThemeConfig
    toggleTheme: () => void
    updateConfig: (newConfig: ThemeConfig) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
    children: ReactNode
    config: ThemeConfig
}

export function ThemeProvider({ children, config }: ThemeProviderProps) {
    const [isDark, setIsDark] = useState(false)
    const [currentConfig, setCurrentConfig] = useState(config)

    useEffect(() => {
        // Update current config when prop changes
        setCurrentConfig(config)
    }, [config])

    useEffect(() => {
        // Check if user has a preference stored
        const stored = localStorage.getItem('theme-mode')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        const shouldBeDark = stored === 'dark' || (!stored && prefersDark)
        setIsDark(shouldBeDark)

        // Apply theme immediately
        applyTheme(shouldBeDark, currentConfig)

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme-mode')) {
                setIsDark(e.matches)
                applyTheme(e.matches, currentConfig)
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [currentConfig])

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
        applyTheme(newTheme, currentConfig)
        localStorage.setItem('theme-mode', newTheme ? 'dark' : 'light')
    }

    const updateConfig = (newConfig: ThemeConfig) => {
        setCurrentConfig(newConfig)
        applyTheme(isDark, newConfig)
    }

    return (
        <ThemeContext.Provider value={{
            isDark,
            config: currentConfig,
            toggleTheme,
            updateConfig
        }}>
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