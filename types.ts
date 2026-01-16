
export interface OntologyNode {
  id: string;
  label: string;
  group: number; // Layer 1-4
  description: string;
}

export interface OntologyLink {
  source: string;
  target: string;
  relationship: string;
}

export interface OntologyData {
  nodes: OntologyNode[];
  links: OntologyLink[];
}

export enum Layer {
  Foundation = 1,
  CoreRobotics = 2,
  PhysicalAI = 3,
  Vibe = 4
}

export const LAYER_LABELS: Record<number, string> = {
  1: 'Layer 1: Foundations',
  2: 'Layer 2: Core Robotics',
  3: 'Layer 3: Physical AI',
  4: 'Layer 4: Vibe'
};

export const LAYER_COLORS: Record<number, string> = {
  1: '#3b82f6', // blue
  2: '#10b981', // emerald
  3: '#8b5cf6', // violet
  4: '#f43f5e'  // rose
};
