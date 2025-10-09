import React from 'react'
import { useTheme } from 'styled-components'

interface ProgressRingProps {
  size?: number
  stroke?: number
  progress: number // 0..1
}

const ProgressRing: React.FC<ProgressRingProps> = ({ size = 72, stroke = 8, progress }) => {
  const theme = useTheme()
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, progress))
  const dash = circ * clamped

  return (
    <svg width={size} height={size} role="img" aria-label={`${Math.round(clamped * 100)}% complete`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={theme.color.border}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={theme.color.brand[500]}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill={theme.color.text.primary}
      >
        {Math.round(clamped * 100)}%
      </text>
    </svg>
  )
}

export default ProgressRing




