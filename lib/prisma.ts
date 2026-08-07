import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  var prisma: PrismaClient | undefined;
}

const databaseUrl = new URL(process.env.DATABASE_URL || "mysql://root@localhost:3306/gift_gallery");

const adapter = new PrismaMariaDb(
  {
    host: databaseUrl.hostname || "localhost",
    port: databaseUrl.port ? parseInt(databaseUrl.port) : 3306,
    user: decodeURIComponent(databaseUrl.username),
    password: databaseUrl.password ? decodeURIComponent(databaseUrl.password) : "",
    database: databaseUrl.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    acquireTimeout: 3000,
    connectTimeout: 3000,
  },
  {
    useTextProtocol: true,
  }
);

const prisma = global.prisma || new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
