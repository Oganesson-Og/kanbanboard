import React, { useState } from 'react'
import styled from 'styled-components'

export interface Tag {
  id: string
  name: string
  color: string
}

interface TagsManagerProps {
  availableTags: Tag[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  onCreateTag?: (tag: Omit<Tag, 'id'>) => void
  showCreateForm?: boolean
}

const TagsContainer = styled.div`
  margin: 1rem 0;
`

const TagsLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const TagItem = styled.button<{ selected: boolean; color: string }>`
  padding: 0.25rem 0.75rem;
  border: 1px solid ${props => props.color};
  border-radius: 16px;
  background: ${props => props.selected ? props.color : 'white'};
  color: ${props => props.selected ? 'white' : props.color};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    background: ${props => props.selected ? props.color : props.color + '20'};
  }
`

const CreateTagForm = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
`

const CreateTagTitle = styled.h4`
  font-size: 0.9rem;
  color: #333;
  margin: 0 0 0.5rem 0;
`

const CreateTagRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const CreateTagInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const ColorPicker = styled.input`
  width: 40px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`

const CreateTagButton = styled.button`
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a6fd8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e9ecef;
  }
`

// Predefined colors for tags
const TAG_COLORS = [
  '#e74c3c', '#f39c12', '#f1c40f', '#27ae60',
  '#3498db', '#9b59b6', '#e67e22', '#1abc9c',
  '#34495e', '#95a5a6', '#667eea', '#764ba2'
]

const TagsManager: React.FC<TagsManagerProps> = ({
  availableTags,
  selectedTags,
  onTagsChange,
  onCreateTag,
  showCreateForm = false
}) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const handleCreateTag = () => {
    if (newTagName.trim() && onCreateTag) {
      onCreateTag({
        name: newTagName.trim(),
        color: newTagColor
      })
      setNewTagName('')
      setNewTagColor(TAG_COLORS[0])
      setIsCreating(false)
    }
  }

  const handleCancelCreate = () => {
    setNewTagName('')
    setNewTagColor(TAG_COLORS[0])
    setIsCreating(false)
  }

  return (
    <TagsContainer>
      <TagsLabel>Tags</TagsLabel>

      <TagsList>
        {availableTags.map(tag => (
          <TagItem
            key={tag.id}
            selected={selectedTags.includes(tag.id)}
            color={tag.color}
            onClick={() => handleTagToggle(tag.id)}
          >
            {tag.name}
          </TagItem>
        ))}
      </TagsList>

      {showCreateForm && (
        <>
          {!isCreating ? (
            <CreateTagButton onClick={() => setIsCreating(true)}>
              + Create New Tag
            </CreateTagButton>
          ) : (
            <CreateTagForm>
              <CreateTagTitle>Create New Tag</CreateTagTitle>
              <CreateTagRow>
                <CreateTagInput
                  type="text"
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  autoFocus
                />
                <ColorPicker
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                />
                <CreateTagButton
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                >
                  Create
                </CreateTagButton>
                <CancelButton onClick={handleCancelCreate}>
                  Cancel
                </CancelButton>
              </CreateTagRow>
            </CreateTagForm>
          )}
        </>
      )}
    </TagsContainer>
  )
}

export default TagsManager

