import React, { useState, useRef, useEffect } from 'react';
import type { UserCredentials } from '../types/auth';

interface LoginFormProps {
  onSubmit: (credentials: UserCredentials) => Promise<void>;
  onSwitchToSignUp: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSwitchToSignUp,
  isLoading,
  error
}) => {
  const [formData, setFormData] = useState<UserCredentials>({
    email: '',
    password: '',
  });

  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Ensure first Tab focuses the email input (Mobile Safari focus management)
  useEffect(() => {
    const focusWhenReady = () => {
      const start = performance.now();
      const tryFocus = () => {
        if (emailRef.current) {
          emailRef.current.focus();
        } else if (performance.now() - start < 1000) {
          requestAnimationFrame(tryFocus);
        }
      };
      tryFocus();
    };

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const active = document.activeElement as HTMLElement | null;
        const noneOrPage =
          !active ||
          active === document.body ||
          active === document.documentElement;
        if (noneOrPage) {
          e.preventDefault();
          focusWhenReady();
        }
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, []);

  // If a global flag was set before this component mounted (from main.tsx),
  // focus the email input as soon as it's available.
  useEffect(() => {
    const w = window as any;
    if (w.__focusEmailOnMount) {
      w.__focusEmailOnMount = false;
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        const noneOrPage =
          !active ||
          active === document.body ||
          active === document.documentElement;

        if (noneOrPage) {
          const start = performance.now();
          const tryFocus = () => {
            if (emailRef.current) {
              emailRef.current.focus();
            } else if (performance.now() - start < 1000) {
              requestAnimationFrame(tryFocus);
            }
          };
          tryFocus();
        }
      }, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍷 Wine Journal
          </h1>
          <h2 className="text-xl font-semibold text-gray-700">
            Sign in to your account
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  ref={emailRef}
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
