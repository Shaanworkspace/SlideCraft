import { Presentation, Slide } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for presentations
export interface IStorage {
  getPresentation(id: string): Promise<Presentation | undefined>;
  getAllPresentations(): Promise<Presentation[]>;
  createPresentation(presentation: Presentation): Promise<Presentation>;
  updatePresentation(id: string, presentation: Presentation): Promise<Presentation | undefined>;
  deletePresentation(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private presentations: Map<string, Presentation>;

  constructor() {
    this.presentations = new Map();
  }

  async getPresentation(id: string): Promise<Presentation | undefined> {
    return this.presentations.get(id);
  }

  async getAllPresentations(): Promise<Presentation[]> {
    return Array.from(this.presentations.values());
  }

  async createPresentation(presentation: Presentation): Promise<Presentation> {
    const id = randomUUID();
    const newPresentation: Presentation = { ...presentation, id };
    this.presentations.set(id, newPresentation);
    return newPresentation;
  }

  async updatePresentation(id: string, presentation: Presentation): Promise<Presentation | undefined> {
    if (this.presentations.has(id)) {
      this.presentations.set(id, presentation);
      return presentation;
    }
    return undefined;
  }

  async deletePresentation(id: string): Promise<boolean> {
    return this.presentations.delete(id);
  }
}

export const storage = new MemStorage();