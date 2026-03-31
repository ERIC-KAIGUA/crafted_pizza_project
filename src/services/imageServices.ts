import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase/config";

// ─── WebP Conversion ──────────────────────────────────────────────────────────

const WEBP_QUALITY = 0.85;


const MAX_DIMENSION = 1200;

export const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // 1. Create an object URL so we can load the file into an img element
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // 2. Calculate output dimensions — scale down if needed
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height / width) * MAX_DIMENSION);
          width  = MAX_DIMENSION;
        } else {
          width  = Math.round((width / height) * MAX_DIMENSION);
          height = MAX_DIMENSION;
        }
      }

      // 3. Draw the image onto a canvas at the output dimensions
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // 4. Export as WebP blob
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl); // clean up the object URL
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas WebP conversion returned null"));
          }
        },
        "image/webp",
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for conversion"));
    };

    img.src = objectUrl;
  });
};

export const uploadMenuImage = async (
  file: File,
  categoryId: string,
  itemId: string
): Promise<string> => {
  // Convert to WebP first
  const webpBlob = await convertToWebP(file);

  // Build the Storage reference
  const imageRef = ref(storage, `menuImages/${categoryId}/${itemId}.webp`);

  // Upload — metadata tells the browser/CDN this is a WebP image
  await uploadBytes(imageRef, webpBlob, { contentType: "image/webp" });

  // Return the public download URL that gets saved into Firestore
  const downloadUrl = await getDownloadURL(imageRef);
  return downloadUrl;
};



export const deleteMenuImage = async (
  categoryId: string,
  itemId: string
): Promise<void> => {
  try {
    const imageRef = ref(storage, `menuImages/${categoryId}/${itemId}.webp`);
    await deleteObject(imageRef);
  } catch(e) {
    console.log(e)
  }
};