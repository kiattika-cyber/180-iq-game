
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GameSession, PlayerAnswer } from '../types';
import { APP_TITLE } from '../constants';

const thaiFont = `
@font-face {
  font-family: 'Kanit';
  src: url('https://fonts.gstatic.com/s/kanit/v12/nKKZ-Go6G5tXcraBGwCKd6xBDFs.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'Kanit';
  src: url('https://fonts.gstatic.com/s/kanit/v12/nKKU-Go6G5tXcr5aOhWzVaFrNlM.woff2') format('woff2');
  font-weight: bold;
  font-style: normal;
}
`;

function addThaiFontToJsPDF(doc: jsPDF) {
  // This is a workaround. jsPDF has limited Unicode support for built-in fonts.
  // For proper Thai, you'd typically use a font that supports it and embed it.
  // The \`html2canvas\` approach bypasses this by rendering HTML first.
  // If directly adding text with jsPDF, font setup is crucial.
  // This example will primarily rely on html2canvas for complex content.
  // Actual base64 font data is very large. Placeholder kept.
  doc.addFileToVFS("Kanit-Regular.ttf", "AAAA"); // Placeholder base64 data
  doc.addFont("Kanit-Regular.ttf", "Kanit", "normal");
  doc.setFont("Kanit");
}


export async function generatePdfReport(sessionData: GameSession): Promise<void> {
  const reportElement = document.createElement('div');
  reportElement.style.fontFamily = "'Kanit', sans-serif";
  reportElement.style.padding = '20px';
  reportElement.style.width = '210mm'; // A4 width
  reportElement.style.color = '#000000'; // Ensure text is black for PDF
  reportElement.style.backgroundColor = '#FFFFFF'; // Ensure background is white

  let htmlContent = `
    <style>${thaiFont}</style>
    <div style="font-family: 'Kanit', sans-serif;">
      <h1 style="font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px;">${APP_TITLE} - รายงานผลการทดสอบ</h1>
      <div style="margin-bottom: 15px; font-size: 14px;">
        <p><strong>ชื่อผู้เล่น:</strong> ${sessionData.playerName}</p>
        <p><strong>ระดับความยาก:</strong> ${sessionData.difficulty}</p>
        <p><strong>รูปแบบโจทย์:</strong> ${sessionData.problemDigits}</p>
        <p><strong>วันที่:</strong> ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
      </div>
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">สรุปผลการเล่น</h2>
      <div style="margin-bottom: 15px; font-size: 14px;">
        <p><strong>คะแนนรวม:</strong> ${sessionData.score} / ${sessionData.answers.length * 10}</p>
        <p><strong>ความแม่นยำ:</strong> ${sessionData.accuracy.toFixed(1)}%</p>
        <p><strong>เวลาทั้งหมด:</strong> ${(sessionData.totalTime / 1000).toFixed(2)} วินาที</p>
        <p><strong>เวลาเฉลี่ยต่อข้อ:</strong> ${(sessionData.answers.length > 0 ? (sessionData.totalTime / 1000 / sessionData.answers.length) : 0).toFixed(2)} วินาที</p>
      </div>
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">รายละเอียดรายข้อ</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom:20px;">
        <thead>
          <tr style="background-color: #e2e8f0;">
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">ข้อที่</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">โจทย์ (ตัวเลข)</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">เป้าหมาย</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">คำตอบของคุณ</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">สถานะ</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">เวลา (วินาที)</th>
          </tr>
        </thead>
        <tbody>
  `;

  sessionData.answers.forEach((ans, index) => {
    htmlContent += `
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${index + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${ans.problem.numbers.join(', ')}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${ans.problem.target}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px; word-break: break-all;">${ans.equation || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${ans.status === 'correct' ? 'ถูกต้อง' : ans.status === 'incorrect' ? 'ผิด' : 'ข้าม'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">${(ans.timeTaken / 1000).toFixed(2)}</td>
      </tr>
    `;
    if (ans.aiSolution || ans.aiAlternative) {
      htmlContent += `
        <tr>
          <td colspan="6" style="border: 1px solid #cbd5e1; padding: 8px; background-color: #f7fafc;">
            <strong>AI (${ans.aiSolution ? 'เฉลย' : 'วิธีอื่น'}):</strong>
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 11px;">${ans.aiSolution || ans.aiAlternative}</pre>
          </td>
        </tr>
      `;
    }
  });

  htmlContent += `
        </tbody>
      </table>
      <p style="font-size: 10px; text-align: center; margin-top: 20px;">รายงานนี้สร้างโดย ${APP_TITLE}</p>
    </div>
  `;
  
  reportElement.innerHTML = htmlContent;
  document.body.appendChild(reportElement); // Add to body for html2canvas to render

  try {
    const canvas = await html2canvas(reportElement, {
        scale: 2, // Increase scale for better quality
        useCORS: true, // If using external images/fonts
        onclone: (documentClone) => {
            // Ensure fonts are available in the cloned document if loaded via JS
            const style = documentClone.createElement('style');
            style.innerHTML = thaiFont;
            documentClone.head.appendChild(style);
        }
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    
    let finalImgWidth = pdfWidth - 20; // With margin
    let finalImgHeight = finalImgWidth / ratio;

    if (finalImgHeight > pdfHeight - 20) {
        finalImgHeight = pdfHeight - 20;
        finalImgWidth = finalImgHeight * ratio;
    }
    
    const xPos = (pdfWidth - finalImgWidth) / 2;
    const yPos = 10;

    pdf.addImage(imgData, 'PNG', xPos, yPos, finalImgWidth, finalImgHeight);
    pdf.save(`รายงาน_${sessionData.playerName}_${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("เกิดข้อผิดพลาดในการสร้างรายงาน PDF");
  } finally {
    document.body.removeChild(reportElement); // Clean up
  }
}
