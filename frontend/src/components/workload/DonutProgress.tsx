import React from 'react'

type Props = { value:number; size?:number; stroke?:number; label?:string }

function clamp(n:number){ return Math.max(0, Math.min(100, n)) }

const DonutProgress: React.FC<Props> = ({ value, size=56, stroke=6, label }) => {
  const v = clamp(value)
  const r = (size - stroke)/2
  const c = 2*Math.PI*r
  const o = c*(1 - v/100)

  return (
    <figure aria-label={label ?? 'Progress'} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} role="img" style={{width:size,height:size}}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} fill="none" stroke="currentColor" opacity={0.15} />
        <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} fill="none"
          stroke="currentColor" strokeDasharray={c} strokeDashoffset={o}
          style={{transform:'rotate(-90deg)', transformOrigin:'50% 50%'}} />
      </svg>
      <figcaption style={{position:'relative', marginTop:-size, height:size, display:'grid', placeItems:'center', fontWeight:700}}>
        {Math.round(v)}%
      </figcaption>
    </figure>
  )
}

export default React.memo(DonutProgress)


