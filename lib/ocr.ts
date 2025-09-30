import Tesseract from "tesseract.js";

export async function extractLabelText(file: File | Buffer): Promise<string> {
  let buffer: Buffer;
  
  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    // File from browser - type guard ensures this is File
    const arrayBuffer = await (file as File).arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }
  
  const { data } = await Tesseract.recognize(buffer, "eng", {
    logger: () => {},
  });
  return data.text ?? "";
}




