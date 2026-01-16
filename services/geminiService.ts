
import { GoogleGenAI, Type } from "@google/genai";
import { OntologyData } from "../types";

const SYSTEM_INSTRUCTION = `You are a "Physical AI Competency Ontology Architect". 
Your goal is to parse raw text data describing competencies in the Physical AI field and transform them into a structured JSON graph format compatible with NetworkX/D3.

Rules:
1. Identify individual competencies as nodes.
2. Assign each node to a group:
   - Group 1 (Foundation): Math, Physics, Basic Programming (Python, C++).
   - Group 2 (Core Robotics): SLAM, Control Systems, Perception, ROS2.
   - Group 3 (Physical AI): Sim-to-Real, Reinforcement Learning, Transformers for Robotics, Foundation Models.
   - Group 4 (Vibe): Safety Awareness (ISO 10218), Collaborative mindset, Problem Solving, Ethics, Cultural Fit.
3. Define links based on prerequisite or logical connections.
   - Example: ROS2 -> Python/C++
   - Example: Sim-to-Real -> Reinforcement Learning
4. CRITICAL: Explicitly connect Layer 4 (Vibe) to technical skills.
   - Example: "Safety Awareness" should link to "Collaborative Robots" and "Control Systems".
   - Example: "Ethics" should link to "Decision Making" and "Foundation Models".

Ensure the output is strictly JSON and matches the schema provided.`;

export const generateOntology = async (rawData: string): Promise<OntologyData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Transform this data into a Physical AI competency ontology: \n\n${rawData}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                group: { type: Type.NUMBER, description: "1, 2, 3, or 4 based on layers" },
                description: { type: Type.STRING }
              },
              required: ["id", "label", "group", "description"]
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                relationship: { type: Type.STRING }
              },
              required: ["source", "target", "relationship"]
            }
          }
        },
        required: ["nodes", "links"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as OntologyData;
};
