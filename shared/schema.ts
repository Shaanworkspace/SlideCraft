import { z } from "zod";

// Element types that can be added to slides
export const elementTypeSchema = z.enum(['text', 'rectangle', 'circle', 'line', 'image']);

// Base element schema
export const elementSchema = z.object({
  id: z.string(),
  type: elementTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  angle: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  // Fabric.js specific properties
  fabricProps: z.record(z.any()).optional(),
});

// Text element specific properties
export const textElementSchema = elementSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontSize: z.number().positive(),
  fontFamily: z.string().default('Inter'),
  fontWeight: z.enum(['normal', 'bold']).default('normal'),
  fill: z.string().default('#212121'),
  backgroundColor: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).default('left'),
});

// Shape element properties
export const shapeElementSchema = elementSchema.extend({
  type: z.enum(['rectangle', 'circle', 'line']),
  fill: z.string().default('#1976D2'),
  stroke: z.string().optional(),
  strokeWidth: z.number().default(1),
});

// Image element properties
export const imageElementSchema = elementSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().optional(),
});

// Union of all element types
export const slideElementSchema = z.union([
  textElementSchema,
  shapeElementSchema,
  imageElementSchema,
]);

// Slide schema
export const slideSchema = z.object({
  id: z.string(),
  title: z.string(),
  elements: z.array(slideElementSchema),
  // Fabric.js canvas state for restoration
  canvasState: z.record(z.any()).optional(),
});

// Presentation schema
export const presentationSchema = z.object({
  id: z.string(),
  title: z.string(),
  slides: z.array(slideSchema),
  activeSlideId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Insert schemas
export const insertSlideSchema = slideSchema.omit({ id: true });
export const insertPresentationSchema = presentationSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Types
export type ElementType = z.infer<typeof elementTypeSchema>;
export type SlideElement = z.infer<typeof slideElementSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type ShapeElement = z.infer<typeof shapeElementSchema>;
export type ImageElement = z.infer<typeof imageElementSchema>;
export type Slide = z.infer<typeof slideSchema>;
export type Presentation = z.infer<typeof presentationSchema>;
export type InsertSlide = z.infer<typeof insertSlideSchema>;
export type InsertPresentation = z.infer<typeof insertPresentationSchema>;

// UI State types
export type ToolType = 'select' | 'text' | 'rectangle' | 'circle' | 'line' | 'image';

export interface UIState {
  selectedTool: ToolType;
  selectedElementId: string | null;
  showPropertiesPanel: boolean;
  zoom: number;
  canvasSize: { width: number; height: number };
}
