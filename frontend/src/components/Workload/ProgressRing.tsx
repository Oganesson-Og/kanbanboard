import React from 'react'

interface ProgressRingProps {
  size?: number
  stroke?: number
  progress: number // 0..1
}

const ProgressRing: React.FC<ProgressRingProps> = ({ size = 72, stroke = 8, progress }) => {
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
        stroke="#E5E7EB"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#6366F1"
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
        fill="#111827"
      >
        {Math.round(clamped * 100)}%
      </text>
    </svg>
  )
}

export default ProgressRing


