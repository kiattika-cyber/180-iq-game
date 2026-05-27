import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Local helper to initialize Gemini lazily
  let ai: GoogleGenAI | null = null;
  function getAiInstance(): GoogleGenAI {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return ai;
  }

  // API endpoints FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/gemini/get-help", async (req, res) => {
    try {
      const aiInstance = getAiInstance();
      const { problemNumbers, target, operators, playerEquation, isCorrectAttempt } = req.body;

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
      } else {
        prompt += `ผู้เล่นข้ามข้อนี้ไป กรุณาแสดงวิธีคิดที่ถูกต้อง 1 วิธีเพื่อแก้โจทย์นี้ อธิบายขั้นตอนให้ชัดเจน\n`;
      }
      prompt += `คำตอบของคุณควรเป็นสมการและคำอธิบายสั้นๆ (ถ้ามี).\n`;

      const aiResponse = await aiInstance.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });

      res.json({ text: aiResponse.text || "ไม่สามารถรับข้อมูลจาก AI ได้" });
    } catch (error: any) {
      console.error("Server API Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist', 'client');
    // In our build we output to dist directly? Let's check package.json:
    // vite build outputs to `dist`
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
