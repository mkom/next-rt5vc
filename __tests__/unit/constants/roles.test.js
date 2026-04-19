/**
 * @jest-environment node
 */
import { ROLES, DASHBOARD_ALLOWED_ROLES, canAccessDashboard, isAdmin } from '../constants/roles';

describe('Role Constants', () => {
  describe('ROLES', () => {
    it('should have ADMIN role', () => {
      expect(ROLES.ADMIN).toBe('admin');
    });

    it('should have USER role', () => {
      expect(ROLES.USER).toBe('user');
    });
  });

  describe('DASHBOARD_ALLOWED_ROLES', () => {
    it('should only contain ADMIN role', () => {
      expect(DASHBOARD_ALLOWED_ROLES).toHaveLength(1);
      expect(DASHBOARD_ALLOWED_ROLES).toContain('admin');
    });

    it('should not contain USER role', () => {
      expect(DASHBOARD_ALLOWED_ROLES).not.toContain('user');
    });
  });

  describe('canAccessDashboard', () => {
    it('should return true for admin role', () => {
      expect(canAccessDashboard('admin')).toBe(true);
    });

    it('should return false for user role', () => {
      expect(canAccessDashboard('user')).toBe(false);
    });

    it('should return false for undefined role', () => {
      expect(canAccessDashboard(undefined)).toBe(false);
    });

    it('should return false for null role', () => {
      expect(canAccessDashboard(null)).toBe(false);
    });

    it('should return false for empty string role', () => {
      expect(canAccessDashboard('')).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(canAccessDashboard('superadmin')).toBe(false);
      expect(canAccessDashboard('editor')).toBe(false);
      expect(canAccessDashboard('viewer')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin('admin')).toBe(true);
    });

    it('should return false for user role', () => {
      expect(isAdmin('user')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isAdmin(undefined)).toBe(false);
    });
  });
});
