import React from 'react'
import styled from 'styled-components'
import { Board } from '../../types'
import { Surface } from '../primitives'

const Container = styled(Surface)`
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; margin: 12px 0; border-radius: ${({theme})=>theme.radius.lg}px;
`

const Title = styled.h1`
  margin:0; font-size: 1.25rem; color: ${({theme})=>theme.color.text.primary};
`

interface Props { board: Board }

const WorkloadHeader: React.FC<Props> = ({ board }) => {
  return (
    <Container $elevation={1}>
      <div>
        <Title>{board.name}</Title>
        {board.description && <p style={{margin: '6px 0 0', color: '#64748B'}}>{board.description}</p>}
      </div>
      <div />
    </Container>
  )
}

export default WorkloadHeader


