import React from 'react'
import styled from 'styled-components'
import { Surface, PrimaryButton, IconButton, HStack, VStack } from './primitives'

interface BoardSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onDeleteBoard: () => Promise<void> | void
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.z.modal};
`

const Dialog = styled(Surface)`
  width: 520px;
  max-width: calc(100vw - 32px);
  padding: 20px;
  position: relative;
`

const Title = styled.h2`
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.color.text.primary};
`

const Section = styled(VStack)`
  gap: 8px;
  margin-top: 12px;
`

const DangerArea = styled.div`
  border-top: 1px solid ${({ theme }) => theme.color.border};
  margin-top: 16px;
  padding-top: 16px;
`

const DangerButton = styled(PrimaryButton)`
  background: ${({ theme }) => theme.color.danger[600]};
  &:hover { background: #b91c1c; }
`

const Close = styled(IconButton)`
  position: absolute;
  top: 12px;
  right: 12px;
`

const BoardSettingsDialog: React.FC<BoardSettingsDialogProps> = ({ isOpen, onClose, onDeleteBoard }) => {
  if (!isOpen) return null
  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="board-settings-title">
        <Close aria-label="Close" onClick={onClose}>✕</Close>
        <Title id="board-settings-title">Board Settings</Title>

        <Section>
          <div style={{ color: '#475569' }}>Manage board preferences. More options coming soon.</div>
        </Section>

        <DangerArea>
          <h3 style={{ margin: 0, fontSize: 14, color: '#991B1B' }}>Danger</h3>
          <p style={{ margin: '6px 0 12px', color: '#991B1B', fontSize: 13 }}>Deleting this board will permanently remove its columns and tasks.</p>
          <HStack>
            <DangerButton onClick={onDeleteBoard}>Delete Board</DangerButton>
          </HStack>
        </DangerArea>
      </Dialog>
    </Overlay>
  )
}

export default BoardSettingsDialog


