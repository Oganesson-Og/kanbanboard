import React from 'react'
import styled from 'styled-components'
import { Surface, Chip } from './primitives'
import { Tag } from '../types'

interface TagFilterProps {
  availableTags: Tag[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

const FilterContainer = styled(Surface).attrs({ as: 'nav' })`
  margin: 16px 0;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
`

const FilterTitle = styled.h3`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0 0 12px 0;
  font-weight: 600;
`

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`

const FilterTag = styled.button<{ selected: boolean; color: string }>`
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ color }) => color};
  background: ${({ selected, color }) => (selected ? color : 'transparent')};
  color: ${({ selected, color }) => (selected ? '#fff' : color)};
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
`

const ClearButton = styled(Chip).attrs({ as: 'button' })``

const TagFilter: React.FC<TagFilterProps> = ({ availableTags, selectedTags, onTagsChange }) => {
  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const handleClearAll = () => {
    onTagsChange([])
  }

  const selectedCount = selectedTags.length

  return (
    <FilterContainer aria-label="Filters">
      <FilterTitle>
        Filter by Tags {selectedCount > 0 && `(${selectedCount} selected)`}
      </FilterTitle>

      {availableTags.length > 0 ? (
        <>
          <FilterTags>
            {availableTags.map(tag => (
              <FilterTag
                key={tag.id}
                selected={selectedTags.includes(tag.id)}
                color={tag.color}
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.name}
              </FilterTag>
            ))}
          </FilterTags>

          {selectedCount > 0 && (
            <ClearButton onClick={handleClearAll}>
              Clear All
            </ClearButton>
          )}
        </>
      ) : (
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          No tags available. Create some tags to filter tasks.
        </div>
      )}
    </FilterContainer>
  )
}

export default TagFilter

