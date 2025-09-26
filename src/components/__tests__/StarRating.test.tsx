import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '../StarRating';

describe('StarRating', () => {
  it('renders the correct number of stars', () => {
    render(<StarRating rating={3} />);
    
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('displays the correct rating visually', () => {
    render(<StarRating rating={3} />);
    
    const stars = screen.getAllByRole('button');
    
    // First 3 stars should be filled (yellow)
    for (let i = 0; i < 3; i++) {
      const svg = stars[i].querySelector('svg');
      expect(svg).toHaveClass('text-yellow-400');
    }
    
    // Last 2 stars should be empty (gray)
    for (let i = 3; i < 5; i++) {
      const svg = stars[i].querySelector('svg');
      expect(svg).toHaveClass('text-gray-300');
    }
  });

  it('calls onRatingChange when a star is clicked', () => {
    const mockOnRatingChange = vi.fn();
    render(<StarRating rating={2} onRatingChange={mockOnRatingChange} />);
    
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[3]); // Click the 4th star (index 3, rating 4)
    
    expect(mockOnRatingChange).toHaveBeenCalledWith(4);
  });

  it('does not call onRatingChange when readonly', () => {
    const mockOnRatingChange = vi.fn();
    render(<StarRating rating={2} onRatingChange={mockOnRatingChange} readonly />);
    
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[3]);
    
    expect(mockOnRatingChange).not.toHaveBeenCalled();
  });

  it('displays rating text when not readonly', () => {
    render(<StarRating rating={4} />);
    
    expect(screen.getByText('4 stars')).toBeInTheDocument();
  });

  it('displays singular rating text for 1 star', () => {
    render(<StarRating rating={1} />);
    
    expect(screen.getByText('1 star')).toBeInTheDocument();
  });

  it('does not display rating text when readonly', () => {
    render(<StarRating rating={3} readonly />);
    
    expect(screen.queryByText('3 stars')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<StarRating rating={3} size="sm" />);
    
    let stars = screen.getAllByRole('button');
    expect(stars[0]).toHaveClass('w-4', 'h-4');
    
    rerender(<StarRating rating={3} size="lg" />);
    stars = screen.getAllByRole('button');
    expect(stars[0]).toHaveClass('w-8', 'h-8');
  });
});
