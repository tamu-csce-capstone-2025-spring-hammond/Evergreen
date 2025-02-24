# Evergreen Backend

## Description

A NestJS-based backend service with authentication functionality.

## API Documentation

The APIs are documented in swagger when the backend is running at [backendUrl]/swagger

## Directory Structure

```
backend/
├── prisma/                  # Prisma ORM     
├── src/                    # Source code
│   ├── auth/              # Authentication module
│   │   ├── dto/          # Auth Data Transfer Objects
│   │   ├── auth.controller.ts
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts
│   │   └── auth.type.ts
│   ├── app.module.ts      # Main application module
│   └── main.ts           # Application entry point
└── test/                  # E2E Test files
```

## Project Setup

```bash
$ npm install
```

## Running the Application

```bash
# Development mode with hot-reload
$ npm run start:dev

# Build the application
$ npm run build

# Production mode
$ npm run start:prod
```

## Testing

```bash
# Unit tests
$ npm run test

# End-to-end tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Development Tools

The project uses several development tools:

- ESLint for code linting (.eslintrc.js)
- Prettier for code formatting (.prettierrc)
- TypeScript configuration (tsconfig.json, tsconfig.build.json)

## Resources

- [NestJS Documentation](https://docs.nestjs.com) - Official framework documentation
- [NestJS Courses](https://courses.nestjs.com/) - Official video courses
- [NestJS Devtools](https://devtools.nestjs.com) - Application visualization and debugging tools

## Features

- Authentication system with controller, service, and type definitions
- Modular architecture following NestJS best practices
- Comprehensive test coverage
- TypeScript support
