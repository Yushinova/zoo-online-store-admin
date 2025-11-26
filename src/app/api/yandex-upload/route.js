import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "ru-central1",
  endpoint: process.env.YC_PUBLIC_URL,
  credentials: {
    accessKeyId: process.env.YC_ACCESS_KEY_ID,
    secretAccessKey: process.env.YC_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const customFileName = formData.get('fileName');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Используем переданное имя или генерируем
    const fileName = customFileName || `products/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
      Bucket: process.env.YC_BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    });

    await s3Client.send(command);

    const publicUrl = `${process.env.YC_PUBLIC_URL}/${process.env.YC_BUCKET_NAME}/${fileName}`;

    return NextResponse.json({
      success: true,
      fileName,
      publicUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}

// Добавим метод для удаления
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName parameter is required' },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.YC_BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed: ' + error.message },
      { status: 500 }
    );
  }
}