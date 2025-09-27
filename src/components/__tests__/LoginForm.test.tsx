import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnSwitchToSignUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onSwitchToSignUp: mockOnSwitchToSignUp,
    isLoading: false,
    error: null,
  };

  it('should render login form correctly', () => {
    render(<LoginForm {...defaultProps} />);

    expect(screen.getByText('🍷 Wine Journal')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should submit form with correct data', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should prevent form submission when loading', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} isLoading={true} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Signing in...' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(submitButton).toBeDisabled();

    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should display error message when provided', () => {
    render(<LoginForm {...defaultProps} error="Invalid credentials" />);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials')).toHaveClass('text-red-700');
  });

  it('should call onSwitchToSignUp when sign up link is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} />);

    const signUpLink = screen.getByRole('button', { name: 'Sign up' });
    await user.click(signUpLink);

    expect(mockOnSwitchToSignUp).toHaveBeenCalled();
  });

  it('should require email and password fields', () => {
    render(<LoginForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should have correct input types and autocomplete attributes', () => {
    render(<LoginForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });

  it('should show loading state correctly', () => {
    render(<LoginForm {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: 'Signing in...' });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('should handle form submission with enter key', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.keyboard('{Enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should clear error when form is resubmitted', async () => {
    const { rerender } = render(<LoginForm {...defaultProps} error="Previous error" />);

    expect(screen.getByText('Previous error')).toBeInTheDocument();

    // Rerender without error
    rerender(<LoginForm {...defaultProps} error={null} />);

    expect(screen.queryByText('Previous error')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<LoginForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toHaveAttribute('id', 'email');
    expect(passwordInput).toHaveAttribute('id', 'password');

    const emailLabel = screen.getByText('Email address');
    const passwordLabel = screen.getByText('Password');

    expect(emailLabel).toHaveAttribute('for', 'email');
    expect(passwordLabel).toHaveAttribute('for', 'password');
  });
});
