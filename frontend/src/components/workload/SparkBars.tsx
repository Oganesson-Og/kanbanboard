import React from 'react'

type Props = { series:number[]; max?:number; ariaLabel?: string }

const SparkBars: React.FC<Props> = ({ series, max, ariaLabel }) => {
  const M = max ?? Math.max(1, ...series)
  return (
    <div aria-label={ariaLabel || 'Workload sparklines'} role="img" style={{display:'flex', gap:8, alignItems:'end', height:56}}>
      {series.map((v,i)=> (
        <div key={i} style={{width:8, height:`${(v/M)*100}%`, borderRadius:4, background:'currentColor'}} />
      ))}
    </div>
  )
}

export default React.memo(SparkBars)


