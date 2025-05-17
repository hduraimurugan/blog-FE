import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// Access environment variables prefixed with "VITE_"
const AWS_REGION = import.meta.env.VITE_AWS_REGION;
const AWS_ACCESSKEYID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const AWS_SECRETACCESSKEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const AWS_BUCKET = import.meta.env.VITE_AWS_BUCKET;

// Create an S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESSKEYID,
    secretAccessKey: AWS_SECRETACCESSKEY,
  },
});

// Upload function
export const uploadImageToS3 = async (image, path) => {
  try {
    // Validate that the image is a Blob or File
     // Ensure the image is a valid File or Blob
     if (!(image instanceof Blob || image instanceof File)) {
      throw new Error("Invalid image format. Expected a File or Blob.");
    }

    // Generate a unique key for the file
    const key = `${path}/${uuidv4()}_${image.name}`;

    // Convert File/Blob to an ArrayBuffer (or Uint8Array)
    const arrayBuffer = await image.arrayBuffer();

    // Create a command for S3 upload
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET, // Your S3 bucket
      Key: key,
      Body: arrayBuffer, // Pass ArrayBuffer for compatibility
      ContentType: image.type, // Use the correct MIME type
      ACL: "private", // Modify ACL if needed (e.g., "public-read")
    });

    // Send the command using the S3 client
    await s3Client.send(command);

    console.log("Image uploaded successfully:", key);
    return key; // Return the key of the uploaded image
  } catch (error) {
    console.error("Error uploading to S3:", error.message || error);
    throw new Error("Failed to upload image to S3. Please try again.");
  }
};

// Generate Signed URL Function
export const generateSignedUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 300 seconds = 5 minutes
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
};
