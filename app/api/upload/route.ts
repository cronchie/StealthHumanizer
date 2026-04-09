import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'txt') {
      const text = await file.text();
      return NextResponse.json({ text, name: file.name });
    }

    if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value, name: file.name });
    }

    if (ext === 'pdf') {
      const pdfModule = await import('pdf-parse');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if ('PDFParse' in pdfModule) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        try {
          const result = await parser.getText();
          return NextResponse.json({ text: result.text || '', name: file.name });
        } finally {
          await parser.destroy();
        }
      }
      const legacy = (pdfModule as { default?: (input: Buffer) => Promise<{ text?: string }> }).default;
      if (legacy) {
        const result = await legacy(buffer);
        return NextResponse.json({ text: result.text || '', name: file.name });
      }
      throw new Error('Unsupported pdf-parse module format');
    }

    return NextResponse.json({ error: `Unsupported file type: .${ext}. Supported: .txt, .docx, .pdf` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to parse file' }, { status: 500 });
  }
}
