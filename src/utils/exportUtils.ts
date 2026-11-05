import { jsPDF } from 'jspdf';
import { ChatMessage, PaperSummary, PaperComparisonMatrix } from '../types';

/**
 * Clean sanitization of text for PDF rendering
 */
function cleanForPdf(text: string): string {
  return text
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Downloads a file with given content, filename, and mime type
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// CHAT EXPORT
// -------------------------------------------------------------

export function exportChatAsMarkdown(
  messages: ChatMessage[],
  targetPaperTitle: string = 'All Uploaded Papers'
) {
  const timestamp = new Date().toISOString().split('T')[0];
  let md = `# AI Research Paper Assistant - Chat Archive\n\n`;
  md += `**Target Corpus:** ${targetPaperTitle}\n`;
  md += `**Export Date:** ${new Date().toLocaleString()}\n`;
  md += `**Total Messages:** ${messages.length}\n\n`;
  md += `---\n\n`;

  messages.forEach((msg, idx) => {
    const role = msg.sender === 'user' ? '🧑 Researcher' : '🤖 AI Research Assistant (RAG)';
    md += `### ${role} [${msg.timestamp}]\n\n`;
    md += `${msg.text}\n\n`;

    if (msg.citations && msg.citations.length > 0) {
      md += `#### Retrieved Citations & Evidence:\n\n`;
      msg.citations.forEach((c, cIdx) => {
        md += `- **[${cIdx + 1}] ${c.documentTitle}** (Page ${c.pageNumber}, Match: ${Math.round(c.similarityScore * 100)}%)\n`;
        md += `  > "${c.snippet}"\n\n`;
      });
    }

    md += `---\n\n`;
  });

  const filename = `Research_Chat_Archive_${timestamp}.md`;
  downloadFile(md, filename, 'text/markdown;charset=utf-8');
}

export function exportChatAsPDF(
  messages: ChatMessage[],
  targetPaperTitle: string = 'All Uploaded Papers'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('AI RESEARCH PAPER ASSISTANT · CHAT LOG ARCHIVE', margin, y);
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // Title Banner
  drawHeader();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Research Conversation Archive', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Corpus: ${cleanForPdf(targetPaperTitle)} | Date: ${new Date().toLocaleDateString()}`, margin, y);
  y += 8;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Render Messages
  messages.forEach((msg, idx) => {
    const isUser = msg.sender === 'user';
    const roleText = isUser ? 'QUESTION (Researcher)' : 'ANSWER (AI Research Assistant - RAG)';

    checkPageBreak(25);

    // Sender Label Badge Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    if (isUser) {
      doc.setTextColor(79, 70, 229); // Indigo
    } else {
      doc.setTextColor(15, 23, 42); // Slate 900
    }
    doc.text(`${roleText} · ${msg.timestamp}`, margin, y);
    y += 5;

    // Message Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const splitText = doc.splitTextToSize(cleanForPdf(msg.text), contentWidth);
    checkPageBreak(splitText.length * 4.5 + 4);
    doc.text(splitText, margin, y);
    y += splitText.length * 4.5 + 4;

    // Citations
    if (msg.citations && msg.citations.length > 0) {
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Citations & Evidentiary Passages (${msg.citations.length}):`, margin, y);
      y += 4;

      msg.citations.forEach((c, cIdx) => {
        checkPageBreak(16);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(67, 56, 202);
        const citationHeader = `[${cIdx + 1}] ${cleanForPdf(c.documentTitle)} (Page ${c.pageNumber}, Match: ${Math.round(c.similarityScore * 100)}%)`;
        doc.text(citationHeader, margin + 2, y);
        y += 4;

        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const quoteText = `"${cleanForPdf(c.snippet.slice(0, 280))}${c.snippet.length > 280 ? '...' : ''}"`;
        const splitQuote = doc.splitTextToSize(quoteText, contentWidth - 4);
        checkPageBreak(splitQuote.length * 3.5 + 2);
        doc.text(splitQuote, margin + 4, y);
        y += splitQuote.length * 3.5 + 3;
      });
    }

    // Divider
    y += 3;
    checkPageBreak(6);
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  });

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - margin + 5);
  }

  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`Research_Chat_Archive_${timestamp}.pdf`);
}

// -------------------------------------------------------------
// SUMMARIZATION EXPORT
// -------------------------------------------------------------

export function exportSummaryAsMarkdown(
  docTitle: string,
  summary: PaperSummary
) {
  const timestamp = new Date().toISOString().split('T')[0];
  let md = `# Academic Research Paper Summary\n\n`;
  md += `**Document Title:** ${docTitle}\n`;
  md += `**Generated Date:** ${new Date(summary.generatedAt || Date.now()).toLocaleDateString()}\n`;
  md += `**Framework:** 6-Section Scholarly Decomposition (Gemini RAG)\n\n`;
  md += `---\n\n`;

  md += `## 1. Abstract\n${summary.abstract}\n\n`;
  md += `## 2. Research Objective\n${summary.researchObjective}\n\n`;
  md += `## 3. Methodology & Architecture\n${summary.methodology}\n\n`;
  md += `## 4. Key Findings & Empirical Results\n${summary.keyFindings}\n\n`;
  md += `## 5. Conclusion\n${summary.conclusion}\n\n`;
  md += `## 6. Future Scope & Horizons\n${summary.futureScope}\n\n`;
  md += `---\n*Generated by AI Research Paper Assistant*\n`;

  const safeTitle = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  downloadFile(md, `${safeTitle}_Summary_${timestamp}.md`, 'text/markdown;charset=utf-8');
}

export function exportSummaryAsPDF(
  docTitle: string,
  summary: PaperSummary
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('AI RESEARCH PAPER ASSISTANT · SCHOLARLY SUMMARY', margin, y);
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  drawHeader();

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  const splitTitle = doc.splitTextToSize(cleanForPdf(docTitle), contentWidth);
  doc.text(splitTitle, margin, y);
  y += splitTitle.length * 6 + 2;

  // Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date(summary.generatedAt || Date.now()).toLocaleDateString()} | 6-Section Academic Extraction`, margin, y);
  y += 6;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const sections = [
    { title: '1. Abstract', text: summary.abstract, color: [79, 70, 229] },
    { title: '2. Research Objective', text: summary.researchObjective, color: [37, 99, 235] },
    { title: '3. Methodology & Architecture', text: summary.methodology, color: [147, 51, 234] },
    { title: '4. Key Findings & Empirical Results', text: summary.keyFindings, color: [16, 185, 129] },
    { title: '5. Conclusion', text: summary.conclusion, color: [217, 119, 6] },
    { title: '6. Future Scope & Horizons', text: summary.futureScope, color: [14, 165, 233] },
  ];

  sections.forEach((sec) => {
    checkPageBreak(25);

    // Section Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(sec.color[0], sec.color[1], sec.color[2]);
    doc.text(sec.title, margin, y);
    y += 5;

    // Section Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const split = doc.splitTextToSize(cleanForPdf(sec.text), contentWidth);
    checkPageBreak(split.length * 4.5 + 4);
    doc.text(split, margin, y);
    y += split.length * 4.5 + 6;
  });

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - margin + 5);
  }

  const safeTitle = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`${safeTitle}_Summary_${timestamp}.pdf`);
}

// -------------------------------------------------------------
// COMPARISON EXPORT
// -------------------------------------------------------------

export function exportComparisonAsMarkdown(comparison: PaperComparisonMatrix) {
  const timestamp = new Date().toISOString().split('T')[0];
  let md = `# Academic Comparative Analysis Matrix\n\n`;
  md += `**Compared Papers:** ${comparison.paperTitles.join(', ')}\n`;
  md += `**Generated Date:** ${new Date(comparison.generatedAt || Date.now()).toLocaleDateString()}\n\n`;
  md += `---\n\n`;

  comparison.comparisonAspects.forEach((asp) => {
    md += `## ${asp.aspect}\n\n`;
    asp.items.forEach((item) => {
      md += `### ${item.paperTitle}\n${item.content}\n\n`;
    });
  });

  md += `## Synthesis & Meta-Evaluation\n\n${comparison.synthesis}\n\n`;
  md += `---\n*Generated by AI Research Paper Assistant*\n`;

  downloadFile(md, `Comparative_Analysis_${timestamp}.md`, 'text/markdown;charset=utf-8');
}

export function exportComparisonAsPDF(comparison: PaperComparisonMatrix) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('AI RESEARCH PAPER ASSISTANT · COMPARATIVE MATRIX', margin, y);
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  drawHeader();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('Comparative Paper Analysis', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Papers: ${cleanForPdf(comparison.paperTitles.join(' vs. '))}`, margin, y);
  y += 8;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  comparison.comparisonAspects.forEach((asp) => {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text(asp.aspect, margin, y);
    y += 5;

    asp.items.forEach((item) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${cleanForPdf(item.paperTitle)}:`, margin + 2, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const split = doc.splitTextToSize(cleanForPdf(item.content), contentWidth - 4);
      checkPageBreak(split.length * 4 + 3);
      doc.text(split, margin + 4, y);
      y += split.length * 4 + 4;
    });

    y += 2;
  });

  // Synthesis
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Synthesis & Meta-Analytical Evaluation', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const splitSynthesis = doc.splitTextToSize(cleanForPdf(comparison.synthesis), contentWidth);
  checkPageBreak(splitSynthesis.length * 4.5 + 4);
  doc.text(splitSynthesis, margin, y);
  y += splitSynthesis.length * 4.5 + 4;

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - margin + 5);
  }

  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`Comparative_Analysis_${timestamp}.pdf`);
}
