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

## Backend Setup

### **1. Set up .Env File**

Fill in all fields in .env file as found in .env.example. For the JWT_SECRET, you can generate it using:

```JS
import { randomBytes } from "crypto";

const jwtSecretKey = randomBytes(64).toString("hex");
console.log("Generated JWT Secret Key:", jwtSecretKey);
```
  

---

  

### **2. npm install**

Run the following terminal command:
```Bash
npm install
```


---

  

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

## Bearer Token
- A bearer token featuring an unexpired JWT token must be passed for any non-auth APIs