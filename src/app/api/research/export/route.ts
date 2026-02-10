import { NextRequest, NextResponse } from 'next/server';
import { ResearchPaper } from '@/types/paper';
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const { paper, format } = await request.json();

    if (format === 'pdf') {
      return generatePDF(paper);
    } else if (format === 'docx') {
      return generateDOCX(paper);
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

async function generatePDF(paper: ResearchPaper): Promise<NextResponse> {
  // Use a simple HTML-to-PDF approach since PDFKit has font issues
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
    h1 { font-size: 18pt; text-align: center; margin-bottom: 30px; }
    h2 { font-size: 14pt; margin-top: 25px; margin-bottom: 10px; }
    .abstract { font-style: italic; margin: 20px 0; }
    .keywords { margin-bottom: 20px; }
    p { text-align: justify; margin-bottom: 12px; }
    .references { font-size: 10pt; }
    .ref-item { margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>${paper.title}</h1>
  
  <h2>Abstract</h2>
  <div class="abstract">${paper.abstract}</div>
  
  <div class="keywords"><strong>Keywords:</strong> ${paper.keywords.join(', ')}</div>
  
  <h2>I. Introduction</h2>
  <p>${paper.introduction}</p>
  
  <h2>II. Methodology</h2>
  <p>${paper.methodology}</p>
  
  <h2>III. Results</h2>
  <p>${paper.results}</p>
  
  <h2>IV. Discussion</h2>
  <p>${paper.discussion}</p>
  
  <h2>V. Conclusion</h2>
  <p>${paper.conclusion}</p>
  
  <h2>References</h2>
  <div class="references">
    ${paper.references.map((ref, i) => `<div class="ref-item">[${i + 1}] ${ref}</div>`).join('')}
  </div>
</body>
</html>`;

  // Return HTML as a downloadable file that can be printed to PDF
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': 'attachment; filename="research-paper.html"',
    },
  });
}

async function generateDOCX(paper: ResearchPaper): Promise<NextResponse> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: paper.title,
          heading: HeadingLevel.TITLE,
          alignment: 'center',
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Abstract', bold: true }),
          ],
        }),
        new Paragraph(paper.abstract),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Keywords: ', bold: true }),
            new TextRun(paper.keywords.join(', ')),
          ],
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'I. Introduction',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph(paper.introduction),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'II. Methodology',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph(paper.methodology),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'III. Results',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph(paper.results),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'IV. Discussion',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph(paper.discussion),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'V. Conclusion',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph(paper.conclusion),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'References',
          heading: HeadingLevel.HEADING_1,
        }),
        ...paper.references.map((ref, i) => 
          new Paragraph(`[${i + 1}] ${ref}`)
        ),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="research-paper.docx"',
    },
  });
}
