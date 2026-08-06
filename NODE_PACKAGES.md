# Required Node Packages

This file lists all required Node.js packages for the Gift Gallery project.

## Core Dependencies

| Package Name | Purpose | Installation Command |
| :--- | :--- | :--- |
| `prisma` | ORM for MySQL | `npm install prisma --save-dev` |
| `@prisma/client` | Prisma Client | `npm install @prisma/client` |
| `next-auth` | Authentication framework | `npm install next-auth` |
| `@auth/prisma-adapter` | Prisma adapter for NextAuth | `npm install @auth/prisma-adapter` |
| `zod` | Schema validation | `npm install zod` |
| `bcryptjs` | Password hashing | `npm install bcryptjs` |
| `@types/bcryptjs` | Types for bcryptjs | `npm install --save-dev @types/bcryptjs` |
| `nodemailer` | Email sending (SMTP) | `npm install nodemailer` |
| `@types/nodemailer` | Types for nodemailer | `npm install --save-dev @types/nodemailer` |
| `cloudinary` | Image storage | `npm install cloudinary` |
| `lucide-react` | Icons for UI | `npm install lucide-react` |
| `clsx` | Class name utility | `npm install clsx` |
| `tailwind-merge` | Tailwind class merging | `npm install tailwind-merge` |

## Installation

Run all commands in your terminal to install the necessary packages.
```bash
# Core
npm install @prisma/client next-auth @auth/prisma-adapter zod bcryptjs nodemailer cloudinary lucide-react clsx tailwind-merge next-auth next-auth/react

# Dev Dependencies
npm install prisma --save-dev
npm install --save-dev @types/bcryptjs @types/nodemailer
```
