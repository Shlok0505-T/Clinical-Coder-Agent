import React from 'react';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

interface PdfGeneratorProps {
  codingOutput: any;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ codingOutput }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Clinical Coding Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
    if (codingOutput && codingOutput.explanations) {
      doc.setFontSize(14);
      doc.text('Code Explanations:', 20, 50);
      doc.setFontSize(10);
      let y = 60;
      codingOutput.explanations.forEach((e: any) => {
        doc.text(`• ${e.code}: ${e.layperson} (Audit: ${e.audit})`, 20, y);
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    } else {
      doc.setFontSize(12);
      doc.text('No explanations available.', 20, 50);
    }
    doc.save(`coding_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  if (!codingOutput) return null;
  return (
    <div className="text-center mt-4">
      <button
        className="btn btn-primary flex items-center gap-2 mx-auto"
        onClick={generatePDF}
      >
        <Download size={16} />
        Download Coding Report (PDF)
      </button>
    </div>
  );
};
