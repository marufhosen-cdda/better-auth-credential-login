"use client"
import { ThemeToggler } from '@/components/core/ThemeToggler'
import { useTheme } from '@/providers/ThemeProvider'
import React from 'react'

const MainPage = () => {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });
  const { isDark, config } = useTheme()
  return (
    <div className="p-8 space-y-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Theme Example</h1>
        <ThemeToggler />
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Current theme: <span className="font-medium text-foreground">{isDark ? 'Dark' : 'Light'}</span>
        </p>

        <p className="text-muted-foreground">
          Primary color: <span className="font-medium" style={{ color: config.colors.primary }}>{config.colors.primary}</span>
        </p>

        <p className="text-muted-foreground">
          Border radius: <span className="font-medium text-foreground">{config.radius}</span>
        </p>
      </div>

      {/* Primary buttons */}
      <div className="space-y-4">
        <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Primary Button
        </button>

        <button className="w-full px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
          Primary Outline Button
        </button>
      </div>

      {/* Card with dynamic radius */}
      <div className="p-6 bg-card border border-border text-card-foreground" style={{ borderRadius: 'var(--radius)' }}>
        <h3 className="text-lg font-semibold mb-2">Dynamic Card</h3>
        <p className="text-muted-foreground">
          This card uses the dynamic border radius and colors from the theme provider.
        </p>

        {/* Color preview */}
        <div className="mt-4 p-3 bg-primary/20 rounded-md">
          <p className="text-sm text-primary font-medium">
            Themed with: {config.colors.primary}
          </p>
        </div>
      </div>

      {/* Input with dynamic styling */}
      <input
        type="text"
        placeholder="Input with dynamic theming..."
        className="w-full px-3 py-2 bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        style={{ borderRadius: 'calc(var(--radius) - 2px)' }}
      />
    </div>
  )
}

export default MainPage
