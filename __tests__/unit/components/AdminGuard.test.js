import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminGuard from '../../../components/AdminGuard';

// Mock the modules
jest.mock('next-auth/react');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock Spinner component
jest.mock('../../../components/Spinner', () => {
  return function MockSpinner() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

describe('AdminGuard', () => {
  const mockReplace = jest.fn();
  const mockRouter = {
    replace: mockReplace,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });

  it('should show spinner when session is loading', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(
      <AdminGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AdminGuard>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when user is admin', () => {
    useSession.mockReturnValue({
      data: {
        user: { role: 'admin' },
      },
      status: 'authenticated',
    });

    render(
      <AdminGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AdminGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should redirect to home with access_denied when user is not admin', () => {
    useSession.mockReturnValue({
      data: {
        user: { role: 'user' },
      },
      status: 'authenticated',
    });

    render(
      <AdminGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AdminGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith('/?access_denied=true');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should redirect when user has no role', () => {
    useSession.mockReturnValue({
      data: {
        user: {},
      },
      status: 'authenticated',
    });

    render(
      <AdminGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AdminGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith('/?access_denied=true');
  });

  it('should show spinner when redirecting non-admin user', () => {
    useSession.mockReturnValue({
      data: {
        user: { role: 'user' },
      },
      status: 'authenticated',
    });

    render(
      <AdminGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AdminGuard>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should return null when unauthenticated (let AuthGuard handle it)', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { container } = render(
      <AdminGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AdminGuard>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should handle various non-admin roles correctly', () => {
    const nonAdminRoles = ['user', 'editor', 'viewer', 'superadmin', 'moderator'];

    nonAdminRoles.forEach((role) => {
      jest.clearAllMocks();
      useSession.mockReturnValue({
        data: {
          user: { role },
        },
        status: 'authenticated',
      });

      render(
        <AdminGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AdminGuard>
      );

      expect(mockReplace).toHaveBeenCalledWith('/?access_denied=true');
    });
  });
});
