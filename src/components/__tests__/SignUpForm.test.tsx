import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from '../SignUpForm';

describe('SignUpForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onSwitchToLogin: mockOnSwitchToLogin,
    isLoading: false,
    error: null,
  };

  it('should render sign up form correctly', () => {
    render(<SignUpForm {...defaultProps} />);

    expect(screen.getByText('🍷 Wine Journal')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Name (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Name (optional)');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('should submit form with correct data', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Name (optional)');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Sign up' });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should submit form without name when not provided', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Sign up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: '',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should show password mismatch error', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveClass('border-red-300');
  });

  it('should disable submit button when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Sign up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');

    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when required fields are empty', () => {
    render(<SignUpForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Sign up' });
    expect(submitButton).toBeDisabled();
  });

  it('should prevent form submission when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Sign up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');

    // Try to submit (button should be disabled)
    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should prevent form submission when loading', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} isLoading={true} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Creating account...' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    expect(submitButton).toBeDisabled();

    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should display error message when provided', () => {
    render(<SignUpForm {...defaultProps} error="Email already exists" />);

    expect(screen.getByText('Email already exists')).toBeInTheDocument();
    expect(screen.getByText('Email already exists')).toHaveClass('text-red-700');
  });

  it('should call onSwitchToLogin when sign in link is clicked', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    const signInLink = screen.getByRole('button', { name: 'Sign in' });
    await user.click(signInLink);

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });

  it('should require email and password fields but not name', () => {
    render(<SignUpForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Name (optional)');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    expect(nameInput).not.toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });

  it('should have correct input types and autocomplete attributes', () => {
    render(<SignUpForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Name (optional)');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    expect(nameInput).toHaveAttribute('type', 'text');
    expect(nameInput).toHaveAttribute('autoComplete', 'name');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
  });

  it('should show loading state correctly', () => {
    render(<SignUpForm {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: 'Creating account...' });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('should display password requirements', () => {
    render(<SignUpForm {...defaultProps} />);

    expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
  });

  it('should handle form submission with enter key', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.keyboard('{Enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: '',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should not show password mismatch error initially', () => {
    render(<SignUpForm {...defaultProps} />);

    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
  });

  it('should clear password mismatch error when passwords match', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    // First create a mismatch
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different');

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();

    // Then fix it
    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, 'password123');

    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<SignUpForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Name (optional)');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    expect(nameInput).toHaveAttribute('id', 'name');
    expect(emailInput).toHaveAttribute('id', 'email');
    expect(passwordInput).toHaveAttribute('id', 'password');
    expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword');

    const nameLabel = screen.getByText('Name (optional)');
    const emailLabel = screen.getByText('Email address');
    const passwordLabel = screen.getByText('Password');
    const confirmPasswordLabel = screen.getByText('Confirm Password');

    expect(nameLabel).toHaveAttribute('for', 'name');
    expect(emailLabel).toHaveAttribute('for', 'email');
    expect(passwordLabel).toHaveAttribute('for', 'password');
    expect(confirmPasswordLabel).toHaveAttribute('for', 'confirmPassword');
  });
});
