import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: 'File is empty.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'txt') {
      const text = await file.text();
      if (!text.trim()) return NextResponse.json({ success: false, error: 'File contains no text content.' }, { status: 400 });
      return NextResponse.json({ success: true, text, name: file.name });
    }

    if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      if (!result.value.trim()) return NextResponse.json({ success: false, error: 'Document contains no text content.' }, { status: 400 });
      return NextResponse.json({ success: true, text: result.value, name: file.name });
    }

    if (ext === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      // Use pdfjs-dist directly (pure JS, no native deps — works on Vercel serverless)
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      // Disable worker for serverless environments
      if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = '';
      }
      const doc = await pdfjs.getDocument({ data: uint8, useSystemFonts: true }).promise;

      let fullText = '';
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      if (!fullText.trim()) {
        return NextResponse.json(
          { success: false, error: 'PDF contains no extractable text. It may be a scanned/image-based PDF.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, text: fullText.trim(), name: file.name });
    }

    return NextResponse.json(
      { error: `Unsupported file type: .${ext}. Supported: .txt, .docx, .pdf` },
      { status: 400 }
    );
  } catch (err: any) {
    const msg = err?.message || 'Failed to parse file';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
