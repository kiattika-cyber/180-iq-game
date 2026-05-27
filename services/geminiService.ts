
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AISolutionRequest } from '../types';
import { AI_MODEL_NAME } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}
// Initialize with API_KEY (which is process.env.API_KEY).
// If API_KEY is undefined, it will be passed as undefined, adhering to guidelines.
const ai = new GoogleGenAI({ apiKey: API_KEY });

function cleanJsonString(jsonStr: string): string {
  let cleaned = jsonStr.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleaned.match(fenceRegex);
  if (match && match[2]) {
    cleaned = match[2].trim();
  }
  return cleaned;
}

export async function getAiHelp(request: AISolutionRequest): Promise<string> {
  if (!API_KEY) {
    return "ข้อผิดพลาด: ไม่ได้ตั้งค่า API Key สำหรับ Gemini";
  }
  
  const { problemNumbers, target, operators, playerEquation, isCorrectAttempt } = request;

  let prompt = `คุณคือผู้ช่วยสอนคณิตศาสตร์ที่เป็นมิตรสำหรับเกม "180 IQ : เกมส์คนอัจฉริยะ"\n`;
  prompt += `โจทย์คือ: ใช้ตัวเลข [${problemNumbers.join(', ')}] เพื่อสร้างสมการให้ได้ผลลัพธ์เท่ากับ ${target}.\n`;
  prompt += `อนุญาตให้ใช้เครื่องหมายทางคณิตศาสตร์เหล่านี้: ${operators.join(', ')} (โดย ^ คือยกกำลัง, √ คือรากที่สอง, ! คือแฟกทอเรียล).\n`;
  prompt += `พยายามใช้ตัวเลขที่ให้มาทุกตัวในสมการถ้าเป็นไปได้ และใช้แต่ละตัวเพียงครั้งเดียวตามจำนวนที่มีในโจทย์.\n\n`;

  if (isCorrectAttempt && playerEquation) {
    prompt += `ผู้เล่นตอบถูกด้วยสมการนี้: ${playerEquation}\n`;
    prompt += `กรุณาแสดงวิธีคิดแบบอื่น อีก 1 วิธี ที่แตกต่างออกไปเพื่อแก้โจทย์นี้ โดยใช้ตัวเลขและเครื่องหมายที่กำหนด อธิบายขั้นตอนถ้าเป็นไปได้\n`;
  } else if (playerEquation) {
    prompt += `ผู้เล่นพยายามตอบด้วยสมการนี้: ${playerEquation} แต่มันผิดหรือไม่สมบูรณ์.\n`;
    prompt += `กรุณาแสดงวิธีคิดที่ถูกต้อง 1 วิธีเพื่อแก้โจทย์นี้ อธิบายขั้นตอนให้ชัดเจน\n`;
  } else { // Skipped question
    prompt += `ผู้เล่นข้ามข้อนี้ไป กรุณาแสดงวิธีคิดที่ถูกต้อง 1 วิธีเพื่อแก้โจทย์นี้ อธิบายขั้นตอนให้ชัดเจน\n`;
  }
  prompt += `คำตอบของคุณควรเป็นสมการและคำอธิบายสั้นๆ (ถ้ามี).\n`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: AI_MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    return response.text || "ไม่สามารถรับข้อมูลจาก AI ได้";
  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error) {
        return `เกิดข้อผิดพลาดในการสื่อสารกับ AI: ${error.message}`;
    }
    return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุในการสื่อสารกับ AI";
  }
}