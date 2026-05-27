
import { AISolutionRequest } from '../types';

export async function getAiHelp(request: AISolutionRequest): Promise<string> {
  try {
    const response = await fetch('/api/gemini/get-help', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    if (!response.ok) {
        return `เกิดข้อผิดพลาดในการสื่อสารกับ AI: ${data.error || 'Unknown error'}`;
    }
    
    return data.text || "ไม่สามารถรับข้อมูลจาก AI ได้";
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return `เกิดข้อผิดพลาดในการสื่อสารกับ AI: ${error.message}`;
  }
}
