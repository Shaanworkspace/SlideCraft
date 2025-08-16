import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This is a local-only presentation editor
  // All data persistence happens through browser file operations
  // No server-side storage or API routes needed

  const httpServer = createServer(app);

  return httpServer;
}