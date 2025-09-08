"use client"

import { useState, useEffect, ReactNode } from 'react'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { FloatingThemeConfig } from './FloatingThemeConfig'

interface ThemeConfig {
    colors: {
        primary: string
    }
    radius: string
}

// Initial theme configuration
const initialThemeConfig: ThemeConfig = {
    colors: {
        primary: "#532cde",
    },
    radius: "0.75rem"
}

interface ClientThemeWrapperProps {
    children: ReactNode
}

export function ClientThemeWrapper({ children }: ClientThemeWrapperProps) {
    const [themeConfig, setThemeConfig] = useState<ThemeConfig>(initialThemeConfig)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Load saved config from localStorage
        const savedConfig = localStorage.getItem('floating-theme-config')
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig)
                setThemeConfig(parsedConfig)
            } catch (error) {
                console.error('Error loading theme config:', error)
            }
        }
    }, [])

    const handleConfigChange = (newConfig: ThemeConfig) => {
        setThemeConfig(newConfig)

        // Save to localStorage
        localStorage.setItem('floating-theme-config', JSON.stringify(newConfig))
    }

    if (!mounted) {
        // Return a basic structure during SSR/hydration
        return (
            <ThemeProvider config={initialThemeConfig}>
                {children}
            </ThemeProvider>
        )
    }

    return (
        <ThemeProvider config={themeConfig}>
            <FloatingThemeConfig onConfigChange={handleConfigChange} />
            {children}
        </ThemeProvider>
    )
}