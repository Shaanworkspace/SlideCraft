// This file is not used in the local-only presentation editor
// All data persistence happens through browser file operations (save/load JSON)
// keeping this file for potential future use if server-side features are needed

export interface IStorage {
  // placeholder for future server-side storage if needed
}

export class MemStorage implements IStorage {
  // placeholder implementation
}

export const storage = new MemStorage();