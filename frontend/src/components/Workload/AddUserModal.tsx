import React, { useState } from 'react'
import styled from 'styled-components'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: { email: string; username: string; full_name: string; password: string; capacityHoursPerWeek?: number; avatarUrl?: string }) => Promise<void> | void
}

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, .5); display: flex; align-items: center; justify-content: center; z-index: 130;
`
const Container = styled.div`
  width: 520px; max-width: 92vw; background: #fff; border-radius: 12px; border: 1px solid #E5E7EB; padding: 20px; box-shadow: 0 20px 60px rgba(0,0,0,.2);
`
const Title = styled.h3`
  margin: 0 0 12px 0; font-weight: 700; font-size: 18px;
`
const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
`
const Input = styled.input`
  height: 36px; padding: 0 10px; border-radius: 8px; border: 1px solid #E5E7EB;
`
const Actions = styled.div`
  display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;
`
const Btn = styled.button`
  height: 36px; border-radius: 8px; padding: 0 12px; border: 1px solid #E5E7EB; background: #fff;
`
const Primary = styled(Btn)`
  background: #6366F1; border-color: #6366F1; color: #fff; font-weight: 700;
`

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState({ email: '', username: '', full_name: '', password: '', capacityHoursPerWeek: '', avatarUrl: '' })
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onCreate({
        email: form.email.trim(),
        username: form.username.trim(),
        full_name: form.full_name.trim(),
        password: form.password,
        capacityHoursPerWeek: form.capacityHoursPerWeek ? Number(form.capacityHoursPerWeek) : undefined,
        avatarUrl: form.avatarUrl.trim() || undefined
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        <Title>Add User</Title>
        <form onSubmit={submit}>
          <Grid>
            <Input placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            <Input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Input placeholder="Capacity (hours/week)" value={form.capacityHoursPerWeek} onChange={e => setForm({ ...form, capacityHoursPerWeek: e.target.value })} />
            <Input placeholder="Avatar URL (optional)" value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} />
          </Grid>
          <Actions>
            <Btn type="button" onClick={onClose}>Cancel</Btn>
            <Primary type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Primary>
          </Actions>
        </form>
      </Container>
    </Overlay>
  )
}

export default AddUserModal


