"use client";

import { useRef, useImperativeHandle, forwardRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Shield, X } from "lucide-react";
import Loading from "./ui/loading";

interface PDFTextExtractorProps {
  text: string;
  setText: (text: string) => void;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  accept?: string;
  dismissive?: boolean;
  onFileSelect?: (fileName: string) => void;
  onContentExtracted?: (content: string, fileName: string) => void;
  onError?: (error: string, fileName: string) => void;
}

export interface PDFTextExtractorRef {
  resetInput: () => void;
}

// ===========================================
// 🛡️ CONFIGURAÇÕES DE SEGURANÇA (ADICIONADO)
// ===========================================

const SECURITY_CONFIG = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  allowedExtensions: ['.pdf', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

// Magic numbers para validação real
const FILE_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  docx: [0x50, 0x4B, 0x03, 0x04], // ZIP signature (DOCX é um ZIP)
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  gif: [0x47, 0x49, 0x46, 0x38],
};

// Função para verificar magic numbers
const checkFileSignature = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);

      const extension = file.name.toLowerCase().split('.').pop();

      switch (extension) {
        case 'pdf':
          resolve(checkSignature(bytes, FILE_SIGNATURES.pdf));
          break;
        case 'docx':
          resolve(checkSignature(bytes, FILE_SIGNATURES.docx));
          break;
        case 'jpg':
        case 'jpeg':
          resolve(checkSignature(bytes, FILE_SIGNATURES.jpeg));
          break;
        case 'png':
          resolve(checkSignature(bytes, FILE_SIGNATURES.png));
          break;
        case 'gif':
          resolve(checkSignature(bytes, FILE_SIGNATURES.gif));
          break;
        case 'txt':
          resolve(isValidTextFile(bytes));
          break;
        default:
          resolve(false);
      }
    };

    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 20));
  });
};

const checkSignature = (bytes: Uint8Array, signature: number[]): boolean => {
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) {
      return false;
    }
  }
  return true;
};

const isValidTextFile = (bytes: Uint8Array): boolean => {
  for (let i = 0; i < Math.min(bytes.length, 1000); i++) {
    const byte = bytes[i];
    if (!(
      (byte >= 32 && byte <= 126) || // ASCII printable
      byte === 9 ||  // Tab
      byte === 10 || // LF
      byte === 13 || // CR
      (byte >= 128 && byte <= 255) // Extended ASCII/UTF-8
    )) {
      return false;
    }
  }
  return true;
};

// Função principal de validação
const validateFileSecurity = async (file: File): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  // 1. Verificar tamanho
  if (file.size > SECURITY_CONFIG.maxSizeBytes) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit (${(SECURITY_CONFIG.maxSizeBytes / 1024 / 1024).toFixed(2)}MB)`);
  }

  // 2. Verificar MIME type
  if (!SECURITY_CONFIG.allowedMimeTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed`);
  }

  // 3. Verificar extensão
  const extension = '.' + file.name.toLowerCase().split('.').pop();
  if (!SECURITY_CONFIG.allowedExtensions.includes(extension)) {
    errors.push(`File extension "${extension}" is not allowed`);
  }

  // 4. Verificar magic numbers
  const hasValidSignature = await checkFileSignature(file);
  if (!hasValidSignature) {
    errors.push(`File signature does not match declared type (possible file spoofing)`);
  }

  // 5. Verificar conteúdo suspeito em texto
  if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
    try {
      const text = await file.slice(0, 4096).text();
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:text\/html/i,
        /eval\s*\(/i,
        /document\.write/i,
        /innerHTML\s*=/i,
        /onclick\s*=/i,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(text)) {
          errors.push('File contains potentially malicious script content');
          break;
        }
      }
    } catch (error) {
      console.warn('Could not scan text content:', error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ===========================================
// 📄 COMPONENTE PRINCIPAL (MODIFICADO)
// ===========================================

const PDFTextExtractor = forwardRef<PDFTextExtractorRef, PDFTextExtractorProps>(({
  setText,
  loading = false,
  setLoading = () => { },
  accept = "application/pdf, .docx, .txt, image/*, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  dismissive,
  onFileSelect,
  onContentExtracted,
  onError
}, ref) => {

  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfLib, setPdfLib] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tesseractLib, setTesseractLib] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mammothLib, setMammothLib] = useState<any>(null);

  // Dynamically import libraries only on client side
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        setPdfLib(pdfjs);

        const tesseract = await import("tesseract.js");
        setTesseractLib(tesseract);

        const mammoth = await import("mammoth");
        setMammothLib(mammoth);

      } catch (error) {
        console.error("Failed to load libraries:", error);
      }
    };

    loadLibraries();
  }, []);

  useImperativeHandle(ref, () => ({
    resetInput: () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }));

  const handleDOCX = async (file: File) => {
    if (!mammothLib) throw new Error("Mammoth library not loaded");

    try {
      console.log("Processing DOCX file...");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammothLib.extractRawText({ arrayBuffer });

      if (result.messages && result.messages.length > 0) {
        console.warn("DOCX processing warnings:", result.messages);
      }

      return result.value || "No text found in DOCX file.";

    } catch (error) {
      console.error("DOCX processing error:", error);
      throw new Error("Error processing DOCX file.");
    }
  };

  const isDOCXFile = (file: File): boolean => {
    return (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith('.docx')
    );
  };

  const extractTextDirectly = async (file: File) => {
    if (!pdfLib) throw new Error("PDF library not loaded");

    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfLib.getDocument({ data: pdfData }).promise;

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += `Page ${i}:\n${pageText}\n\n`;
      }

      return fullText;
    } catch (error) {
      console.error("Error trying to extract text directly:", error);
      return null;
    }
  };

  const extractTextWithOCR = async (file: File) => {
    if (!pdfLib || !tesseractLib) throw new Error("Libraries not loaded");

    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfLib.getDocument({ data: pdfData }).promise;

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const worker = await tesseractLib.createWorker("eng");

        const {
          data: { text: extracted },
        } = await worker.recognize(canvas);

        await worker.terminate();

        fullText += `Page ${i}:\n${extracted}\n\n`;
      }

      return fullText;
    } catch (error) {
      console.error("Erro no OCR:", error);
      return null;
    }
  };

  const handlePDF = async (file: File) => {
    try {
      console.log("Trying directly text extraction...");
      let extractedText = await extractTextDirectly(file);

      if (extractedText && extractedText.trim().length > 50) {
        console.log("✅ Text extracted!");
        return extractedText;
      }

      console.log("⚠️ There is not that much text, let's try OCR...");
      extractedText = await extractTextWithOCR(file);

      return extractedText || "No text was extracted.";
    } catch (error) {
      console.error("Error trying to process PDF:", error);
      throw new Error("Error trying to process PDF.");
    }
  };

  const handleImage = async (file: File) => {
    if (!tesseractLib) throw new Error("Tesseract library not loaded");

    try {
      const worker = await tesseractLib.createWorker("eng");

      const {
        data: { text: extracted },
      } = await worker.recognize(file);

      await worker.terminate();

      return extracted || "No text was extracted from image.";
    } catch (error) {
      console.error("Image processing error:", error);
      throw new Error("Image processing error.");
    }
  };

  const handleTextFile = async (file: File) => {
    try {
      const text = await file.text();
      return text || "No text found in file.";
    } catch (error) {
      console.error("Text file processing error:", error);
      throw new Error("Text file processing error.");
    }
  };

  // 🔒 HANDLER PRINCIPAL ATUALIZADO COM SEGURANÇA
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    onFileSelect?.(fileName);

    setLoading(true);
    setText("");

    try {
      // 🛡️ VALIDAÇÃO DE SEGURANÇA PRIMEIRO
      console.log("🔍 Validating file security...");
      const securityCheck = await validateFileSecurity(file);

      if (!securityCheck.isValid) {
        const errorMessage = `🚨 Security validation failed:\n${securityCheck.errors.join('\n')}`;
        console.error("Security check failed:", securityCheck.errors);
        setText("");
        onError?.(errorMessage, fileName);
        return;
      }

      console.log("✅ File passed security validation");

      // Continuar com processamento normal
      let extractedText = "";

      if (file.type === "application/pdf") {
        extractedText = await handlePDF(file);
      } else if (isDOCXFile(file)) {
        extractedText = await handleDOCX(file);
      } else if (file.type.startsWith("image/")) {
        extractedText = await handleImage(file);
      } else if (file.type === "text/plain" || file.name.endsWith('.txt')) {
        extractedText = await handleTextFile(file);
      } else {
        throw new Error(`File type not supported: ${file.type}`);
      }

      setText(extractedText);
      onContentExtracted?.(extractedText, fileName);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred.";
      console.error("File processing error:", error);

      setText("");
      onError?.(errorMessage, fileName);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!pdfLib || !tesseractLib || !mammothLib) {
    return (
      <div className="bg-primary/20 p-4 rounded-md border-0 flex flex-col gap-4 text-dark-grey">
        <div className="flex items-center justify-center py-4">
          <Loading />
          <span className="ml-2 text-sm">Loading document processors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/20 p-4 rounded-md border-0 flex flex-col gap-4 text-dark-grey">
      <p className="text-sm text-dark-grey">
        Drag and drop a file here or click the button below to select one.
        <br />
        <span className="text-xs opacity-75 text-dark-grey flex items-center gap-1">
          <Shield className="inline" size={14}/> Secured: PDF, DOCX, TXT, Images (max 10MB) • Files are validated for security
        </span>
      </p>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileUpload}
          className="bg-white p-2 px-4 text-primary border-0 rounded-md cursor-pointer flex-1 text-sm"
          disabled={loading}
        />

        {dismissive && (
          <Button
            onClick={handleDismiss}
            variant={'ghost'}
            className='p-1 h-10 w-10 rounded-md bg-gray-100 text-gray-600 hover:bg-red-400 hover:text-white'
            disabled={loading}
            title="Clear file"
          >
            <X size={15} />
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loading />
          <span className="ml-2 text-sm">Processing document...</span>
        </div>
      )}
    </div>
  );
});

PDFTextExtractor.displayName = "PDFTextExtractor";

export default PDFTextExtractor;