import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'txt') {
      const text = await file.text();
      if (!text.trim()) return NextResponse.json({ error: 'File contains no text content.' }, { status: 400 });
      return NextResponse.json({ text, name: file.name });
    }

    if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      if (!result.value.trim()) return NextResponse.json({ error: 'Document contains no text content.' }, { status: 400 });
      return NextResponse.json({ text: result.value, name: file.name });
    }

    if (ext === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let pdfParse: any;
      try {
        pdfParse = await import('pdf-parse');
      } catch {
        return NextResponse.json({ error: 'PDF parsing library not available.' }, { status: 500 });
      }

      // Handle both pdf-parse v1 (default export) and v2 (PDFParse class)
      let text = '';
      try {
        if ('PDFParse' in pdfParse) {
          const parser = new pdfParse.PDFParse({ data: buffer });
          try {
            const result = await parser.getText();
            text = result.text || '';
          } finally {
            await parser.destroy();
          }
        } else {
          const parseFn = pdfParse.default || pdfParse;
          const result = await parseFn(buffer);
          text = result.text || '';
        }
      } catch {
        // If class-based fails, try default function
        try {
          const parseFn = pdfParse.default || pdfParse;
          const result = await parseFn(buffer);
          text = result.text || '';
        } catch {
          throw new Error('Could not parse PDF. The file may be corrupted or password-protected.');
        }
      }

      if (!text.trim()) return NextResponse.json({ error: 'PDF contains no extractable text.' }, { status: 400 });
      return NextResponse.json({ text, name: file.name });
    }

    return NextResponse.json({ error: `Unsupported file type: .${ext}. Supported: .txt, .docx, .pdf` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to parse file' }, { status: 500 });
  }
}
