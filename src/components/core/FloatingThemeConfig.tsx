"use client"

import { useTheme } from '@/providers/ThemeProvider'
import { useState } from 'react'

interface ThemeConfig {
    colors: {
        primary: string
    }
    radius: string
}

interface FloatingThemeConfigProps {
    onConfigChange: (config: ThemeConfig) => void
}

export function FloatingThemeConfig({ onConfigChange }: FloatingThemeConfigProps) {
    const { isDark, config, toggleTheme, updateConfig } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const [tempPrimary, setTempPrimary] = useState(config.colors.primary)
    const [tempRadius, setTempRadius] = useState(config.radius)

    const handleApply = () => {
        const newConfig = {
            colors: { primary: tempPrimary },
            radius: tempRadius
        }

        // Update theme provider immediately
        updateConfig(newConfig)

        // Notify parent component for persistence
        onConfigChange(newConfig)

        setIsOpen(false)
    }

    const handleReset = () => {
        setTempPrimary('#532cde')
        setTempRadius('0.75rem')
    }

    const handleOpen = () => {
        // Sync temp values with current config when opening
        setTempPrimary(config.colors.primary)
        setTempRadius(config.radius)
        setIsOpen(true)
    }

    const presetColors = [
        '#532cde', // Original purple
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#22c55e', // Green
        '#f59e0b', // Amber
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#06b6d4', // Cyan
    ]

    const presetRadius = [
        { label: 'None', value: '0' },
        { label: 'Small', value: '0.375rem' },
        { label: 'Medium', value: '0.75rem' },
        { label: 'Large', value: '1rem' },
        { label: 'Extra Large', value: '1.5rem' }
    ]

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                aria-label="Open theme config"
            >
                <svg
                    className="w-6 h-6 transition-transform group-hover:rotate-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            </button>

            {/* Floating Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-card-foreground">Theme Config</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Theme Mode */}
                        <div className="space-y-4 mb-6">
                            <label className="text-sm font-medium text-card-foreground">Theme Mode</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => isDark && toggleTheme()}
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${!isDark
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-border hover:bg-accent'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Light
                                    </div>
                                </button>
                                <button
                                    onClick={() => !isDark && toggleTheme()}
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${isDark
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-border hover:bg-accent'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                        Dark
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Primary Color */}
                        <div className="space-y-4 mb-6">
                            <label className="text-sm font-medium text-card-foreground">Primary Color</label>

                            {/* Color Input */}
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={tempPrimary}
                                    onChange={(e) => setTempPrimary(e.target.value)}
                                    className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={tempPrimary}
                                    onChange={(e) => setTempPrimary(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="#532cde"
                                />
                            </div>

                            {/* Color Presets */}
                            <div className="grid grid-cols-8 gap-2">
                                {presetColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setTempPrimary(color)}
                                        className={`w-8 h-8 rounded-lg border-2 transition-all ${tempPrimary === color
                                            ? 'border-foreground scale-110'
                                            : 'border-transparent hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Border Radius */}
                        <div className="space-y-4 mb-6">
                            <label className="text-sm font-medium text-card-foreground">Border Radius</label>

                            {/* Radius Input */}
                            <input
                                type="text"
                                value={tempRadius}
                                onChange={(e) => setTempRadius(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="0.75rem"
                            />

                            {/* Radius Presets */}
                            <div className="grid grid-cols-2 gap-2">
                                {presetRadius.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => setTempRadius(preset.value)}
                                        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${tempRadius === preset.value
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-border hover:bg-accent'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="space-y-4 mb-6">
                            <label className="text-sm font-medium text-card-foreground">Preview</label>
                            <div className="p-4 bg-background border border-border rounded-lg space-y-3">
                                <button
                                    className="w-full px-4 py-2 text-white rounded-lg transition-colors"
                                    style={{
                                        backgroundColor: tempPrimary,
                                        borderRadius: tempRadius
                                    }}
                                >
                                    Primary Button
                                </button>
                                <div
                                    className="p-3 bg-card border border-border"
                                    style={{ borderRadius: tempRadius }}
                                >
                                    <p className="text-sm text-card-foreground">Card with custom radius</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}