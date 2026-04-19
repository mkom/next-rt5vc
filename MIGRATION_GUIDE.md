# Dashboard Migration Guide

## Overview

This guide helps developers understand the changes made during the dashboard refactoring and how to work with the new architecture.

## Breaking Changes

### 1. Dashboard Access Control

**CRITICAL**: Dashboard is now restricted to admin users only.

#### Before
```javascript
// Any authenticated user could access dashboard
export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: '/', permanent: false } };
  }
  return { props: {} };
};
```

#### After
```javascript
// Only admin users can access
export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
    return { redirect: { destination: '/', permanent: false } };
  }
  
  // NEW: Check admin role
  if (session.user?.role !== 'admin') {
    return {
      redirect: {
        destination: '/?access_denied=true',
        permanent: false,
      },
    };
  }
  
  return { props: {} };
};
```

## New Architecture

### Folder Structure

```
lib/
├── api/
│   └── client.js              # Axios instance with interceptors
├── repositories/
│   ├── transactionRepository.js
│   └── houseRepository.js
├── services/
│   ├── transactionService.js
│   └── houseService.js
└── hooks/
    ├── useTransactions.js
    └── useHouses.js

components/dashboard/shared/
├── DataTable.js
├── PageHeader.js
├── FilterBar.js
└── StatCardGrid.js

constants/
└── roles.js                   # Role constants

components/
├── AdminGuard.js              # Dashboard protection
└── AccessDenied.js            # Access denied state
```

### Using the New Architecture

#### 1. Data Fetching with Hooks

**Before:**
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/data')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  // ...
};
```

**After:**
```javascript
import { useTransactions } from '../lib/hooks/useTransactions';

const MyComponent = ({ initialData }) => {
  const { transactions, loading, error } = useTransactions({
    initialData,
  });

  // ...
};
```

#### 2. Using Service Layer

```javascript
import TransactionService from '../lib/services/transactionService';

const handleCreateTransaction = async (data) => {
  const service = new TransactionService(session.accessToken);
  
  try {
    const result = await service.createTransaction(data);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

#### 3. Using Shared Components

```javascript
import { PageHeader, DataTable, StatCardGrid } from '../components/dashboard/shared';

const MyPage = () => {
  return (
    <>
      <PageHeader
        title="Data Transaksi"
        icon={FaExchangeAlt}
        description="Kelola transaksi keuangan"
      />

      <StatCardGrid
        stats={[
          { title: 'Total', value: 'Rp 1.000.000', icon: FaWallet, color: 'primary' },
          { title: 'Income', value: 'Rp 2.000.000', icon: FaArrowDown, color: 'success' },
        ]}
      />

      <DataTable
        data={transactions}
        columns={[
          { label: 'No', width: '50px' },
          { label: 'Deskripsi' },
          { label: 'Jumlah', align: 'right' },
        ]}
        renderMobileCard={(item) => (
          <div>{item.description}</div>
        )}
        renderDesktopRow={(item) => (
          <tr>
            <td>{item.id}</td>
            <td>{item.description}</td>
            <td>{item.amount}</td>
          </tr>
        )}
      />
    </>
  );
};
```

## Creating New Admin Pages

### Step-by-Step Guide

1. **Create the page file** in `pages/dashboard/`

2. **Add server-side protection**:
```javascript
export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  
  if (session.user?.role !== 'admin') {
    return {
      redirect: {
        destination: '/?access_denied=true',
        permanent: false,
      },
    };
  }
  
  // Fetch data here
  
  return {
    props: {
      // initialData
    },
  };
};
```

3. **Use DashboardLayout**:
```javascript
MyPage.getLayout = (page) => (
  <DashboardLayout title="My Page">{page}</DashboardLayout>
);
```

4. **Use shared components**:
```javascript
import { PageHeader, DataTable } from '../../components/dashboard/shared';
```

5. **Add tests**:
```javascript
// __tests__/unit/pages/my-page.test.js
describe('MyPage', () => {
  it('should render for admin users', () => {
    // Test implementation
  });
});
```

## Role Management

### Checking Roles

```javascript
import { canAccessDashboard, isAdmin } from '../constants/roles';

// Check if user can access dashboard
const canAccess = canAccessDashboard(session?.user?.role);

// Check if user is admin
const userIsAdmin = isAdmin(session?.user?.role);
```

### Adding New Roles

To add a new role that can access dashboard:

1. Update `constants/roles.js`:
```javascript
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',  // New role
  USER: 'user',
};

export const DASHBOARD_ALLOWED_ROLES = [
  ROLES.ADMIN,
  ROLES.MANAGER,  // Add new role
];
```

2. Update tests in `__tests__/unit/constants/roles.test.js`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests for New Components

```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing Admin-Only Features

```javascript
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react');

describe('Admin Feature', () => {
  it('should show content for admin', () => {
    useSession.mockReturnValue({
      data: { user: { role: 'admin' } },
      status: 'authenticated',
    });
    
    render(<MyComponent />);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should not show content for non-admin', () => {
    useSession.mockReturnValue({
      data: { user: { role: 'user' } },
      status: 'authenticated',
    });
    
    render(<MyComponent />);
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
```

## Common Issues and Solutions

### Issue: "window is not defined" error

**Solution**: Use dynamic imports or check for window:
```javascript
if (typeof window !== 'undefined') {
  // Client-side only code
}
```

### Issue: "Cannot find module" error

**Solution**: Check the import path and ensure the file exists:
```javascript
// Correct
import { useTransactions } from '../../lib/hooks/useTransactions';

// Incorrect
import { useTransactions } from '../hooks/useTransactions';  // Wrong path
```

### Issue: Session is null on first render

**Solution**: Handle loading state:
```javascript
const { data: session, status } = useSession();

if (status === 'loading') {
  return <Spinner />;
}

if (!session) {
  return null;
}
```

## Best Practices

1. **Always use server-side protection** for admin pages
2. **Use custom hooks** for data fetching
3. **Use service layer** for business logic
4. **Use repository layer** for API calls
5. **Use shared components** for consistency
6. **Write tests** for new functionality
7. **Handle loading and error states**
8. **Use TypeScript** when possible (recommended for new projects)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library Documentation](https://testing-library.com/)

---

**Last Updated**: 2026-04-17
**Version**: 1.0.0
