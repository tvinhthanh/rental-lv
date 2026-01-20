# 🧪 Testing Setup Guide

## 📦 Cài đặt Dependencies

### Backend (NestJS)
```bash
cd backend
npm install --save-dev @nestjs/testing jest @types/jest ts-jest supertest @types/supertest
```

### Frontend (Next.js)
```bash
cd frontends
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

## 🔧 Backend Testing Setup

### 1. Tạo `jest.config.js` trong `backend/`

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

### 2. Tạo `package.json` scripts trong `backend/`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### 3. Ví dụ Unit Test: `backend/src/modules/auth/auth.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user and token on successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      // Mock bcrypt compare
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
    });
  });
});
```

### 4. Ví dụ E2E Test: `backend/test/auth.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 🎨 Frontend Testing Setup

### 1. Tạo `jest.config.js` trong `frontends/`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 2. Tạo `jest.setup.js` trong `frontends/`

```javascript
import '@testing-library/jest-dom'
```

### 3. Tạo `package.json` scripts trong `frontends/`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

### 4. Ví dụ Component Test: `frontends/components/__tests__/ExportButtons.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportButtons from '../common/ExportButtons';

// Mock fetch
global.fetch = jest.fn();

describe('ExportButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  it('renders export buttons', () => {
    render(
      <ExportButtons
        exportExcelUrl="/api/export-excel"
        exportPdfUrl="/api/export-pdf"
        filename="test"
      />
    );

    expect(screen.getByText('Xuất Excel')).toBeInTheDocument();
    expect(screen.getByText('Xuất PDF')).toBeInTheDocument();
  });

  it('calls export Excel API on click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(),
    });

    render(
      <ExportButtons
        exportExcelUrl="/api/export-excel"
        filename="test"
      />
    );

    fireEvent.click(screen.getByText('Xuất Excel'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/export-excel',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-token',
          },
        })
      );
    });
  });
});
```

## 📊 Coverage Reports

### Backend
```bash
cd backend
npm run test:cov
```

### Frontend
```bash
cd frontends
npm run test:cov
```

## 🚀 Best Practices

1. **Unit Tests**: Test individual functions/methods
2. **Integration Tests**: Test module interactions
3. **E2E Tests**: Test complete user flows
4. **Coverage**: Aim for >80% coverage
5. **Mocking**: Mock external dependencies (DB, APIs)
6. **Test Data**: Use factories/fixtures for consistent test data

## 📝 Test Structure

```
backend/
  src/
    modules/
      auth/
        auth.service.spec.ts
        auth.controller.spec.ts
  test/
    auth.e2e-spec.ts
    bookings.e2e-spec.ts

frontends/
  components/
    __tests__/
      ExportButtons.test.tsx
      BookingWizard.test.tsx
  app/
    __tests__/
      page.test.tsx
```

## ✅ Next Steps

1. Install dependencies
2. Create test files for critical modules
3. Set up CI/CD to run tests automatically
4. Add coverage reporting
5. Write tests for new features
