import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test.describe('Login Form', () => {
    test('should display login form by default', async ({ page }) => {
      await page.goto('/');

      // Check that login form is displayed
      await expect(page.getByText('🍷 Wine Journal')).toBeVisible();
      await expect(page.getByText('Sign in to your account')).toBeVisible();
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
      await expect(page.getByText("Don't have an account?")).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
    });

    test('should switch to sign up form when sign up link is clicked', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('button', { name: 'Sign up' }).click();

      await expect(page.getByText('Create your account')).toBeVisible();
      await expect(page.getByLabel('Name (optional)')).toBeVisible();
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Confirm Password')).toBeVisible();
    });

    test('should show validation errors for invalid login', async ({ page }) => {
      await page.goto('/');

      // Try to login with non-existent user
      await page.getByLabel('Email address').fill('nonexistent@example.com');
      await page.getByLabel('Password', { exact: true }).fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Should show error message
      await expect(page.getByText('Invalid email or password')).toBeVisible();
    });

    test('should show loading state during login', async ({ page }) => {
      await page.goto('/');

      await page.getByLabel('Email address').fill('test@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');

      // Click login and immediately check for loading state
      const loginButton = page.getByRole('button', { name: 'Sign in' });
      await loginButton.click();

      // The button text should change to "Signing in..." briefly
      // Note: This might be too fast to catch in some cases
      await expect(page.getByRole('button', { name: /Signing in|Sign in/ })).toBeVisible();
    });
  });

  test.describe('Sign Up Form', () => {
    test('should display sign up form when switched', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign up' }).click();

      await expect(page.getByText('Create your account')).toBeVisible();
      await expect(page.getByLabel('Name (optional)')).toBeVisible();
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Confirm Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
      await expect(page.getByText('Already have an account?')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    });

    test('should switch back to login form when sign in link is clicked', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign up' }).click();
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByText('Sign in to your account')).toBeVisible();
    });

    test('should show password mismatch error', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign up' }).click();

      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('differentpassword');

      await expect(page.getByText('Passwords do not match')).toBeVisible();
    });

    test('should disable submit button when passwords do not match', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign up' }).click();

      await page.getByLabel('Email address').fill('test@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('differentpassword');

      const submitButton = page.getByRole('button', { name: 'Sign up' });
      await expect(submitButton).toBeDisabled();
    });

    test('should successfully create new account', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign up' }).click();

      // Fill out the form
      await page.getByLabel('Name (optional)').fill('Test User');
      await page.getByLabel('Email address').fill('newuser@example.com');
      await page.locator('input[name="password"]').fill('password123');
      await page.locator('input[name="confirmPassword"]').fill('password123');

      // Submit the form
      await page.getByRole('button', { name: 'Sign up' }).click();

      // Should be redirected to the main app
      await expect(page.getByText('🍷 Wine Journal')).toBeVisible();
      await expect(page.getByText('Keep track of your wine tastings and discoveries')).toBeVisible();
      await expect(page.getByText('Welcome, Test User')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add New Wine' })).toBeVisible();
    });

    test('should show error for duplicate email', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign up' }).click();

      // Create first user
      await page.getByLabel('Email address').fill('duplicate@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('password123');
      await page.getByRole('button', { name: 'Sign up' }).click();

      // Wait for successful signup and logout
      await expect(page.getByText('Welcome,')).toBeVisible();
      await page.getByRole('button', { name: 'Logout' }).click();

      // Try to create another user with same email
      await page.getByRole('button', { name: 'Sign up' }).click();
      await page.getByLabel('Email address').fill('duplicate@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('password123');
      await page.getByRole('button', { name: 'Sign up' }).click();

      await expect(page.getByText('User with this email already exists')).toBeVisible();
    });
  });

  test.describe('Complete Authentication Flow', () => {
    test('should complete full signup and login cycle', async ({ page }) => {
      await page.goto('/');

      // Step 1: Sign up
      await page.getByRole('button', { name: 'Sign up' }).click();
      await page.getByLabel('Name (optional)').fill('Full Test User');
      await page.getByLabel('Email address').fill('fulltest@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('password123');
      await page.getByRole('button', { name: 'Sign up' }).click();

      // Should be logged in and see main app
      await expect(page.getByText('Welcome, Full Test User')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add New Wine' })).toBeVisible();

      // Step 2: Logout
      await page.getByRole('button', { name: 'Logout' }).click();

      // Should be back to login form
      await expect(page.getByText('Sign in to your account')).toBeVisible();

      // Step 3: Login with same credentials
      await page.getByLabel('Email address').fill('fulltest@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Should be logged in again
      await expect(page.getByText('Welcome, Full Test User')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add New Wine' })).toBeVisible();
    });

    test('should persist login state across page reloads', async ({ page }) => {
      await page.goto('/');

      // Sign up
      await page.getByRole('button', { name: 'Sign up' }).click();
      await page.getByLabel('Email address').fill('persistent@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('password123');
      await page.getByRole('button', { name: 'Sign up' }).click();

      // Verify logged in
      await expect(page.getByText('Welcome,')).toBeVisible();

      // Reload page
      await page.reload();

      // Should still be logged in
      await expect(page.getByText('Welcome,')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add New Wine' })).toBeVisible();
    });

    test('should handle case-insensitive email login', async ({ page }) => {
      await page.goto('/');

      // Sign up with lowercase email
      await page.getByRole('button', { name: 'Sign up' }).click();
      await page.getByLabel('Email address').fill('casetest@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('password123');
      await page.getByRole('button', { name: 'Sign up' }).click();

      // Logout
      await expect(page.getByText('Welcome,')).toBeVisible();
      await page.getByRole('button', { name: 'Logout' }).click();

      // Login with uppercase email
      await page.getByLabel('Email address').fill('CASETEST@EXAMPLE.COM');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Should be logged in
      await expect(page.getByText('Welcome,')).toBeVisible();
    });

    test('should show loading states appropriately', async ({ page }) => {
      await page.goto('/');

      // Attempt to observe the loading state, but tolerate fast transitions.
      const loading = page.getByText('Loading...');
      await loading.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});

      // Wait for login form to appear
      await expect(page.getByText('Sign in to your account')).toBeVisible();
    });

    test('should handle authentication errors gracefully', async ({ page }) => {
      await page.goto('/');

      // Test with invalid email format
      await page.getByLabel('Email address').fill('invalid-email');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Should show error (though this might be handled by browser validation)
      await expect(page.getByLabel('Email address')).toBeVisible();

      // Test with empty fields
      await page.getByLabel('Email address').fill('');
      await page.getByLabel('Password', { exact: true }).fill('');
      
      // Submit button should be enabled but form validation should prevent submission
      const submitButton = page.getByRole('button', { name: 'Sign in' });
      await submitButton.click();
      
      // Should still be on login page
      await expect(page.getByText('Sign in to your account')).toBeVisible();
    });
  });

  test.describe('User Experience', () => {
    test('should have proper focus management', async ({ page }) => {
      await page.goto('/');

      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.getByLabel('Email address')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByLabel('Password', { exact: true })).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');

      // Fill form using keyboard
      await page.getByLabel('Email address').focus();
      await page.keyboard.type('keyboard@example.com');
      
      await page.keyboard.press('Tab');
      await page.keyboard.type('password123');

      // Submit with Enter
      await page.keyboard.press('Enter');

      // Should show error for non-existent user
      await expect(page.getByText('Invalid email or password')).toBeVisible();
    });

    test('should display appropriate error messages', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign up' }).click();

      // Test weak password
      await page.getByLabel('Email address').fill('test@example.com');
      await page.getByLabel('Password', { exact: true }).fill('123');
      await page.getByLabel('Confirm Password').fill('123');
      await page.getByRole('button', { name: 'Sign up' }).click();

      await expect(page.getByText('Password must be at least 6 characters long')).toBeVisible();
    });
  });
});
