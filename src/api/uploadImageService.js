export class UploadService {
  static generateFileName(originalFileName, folder = 'products') {
    const extension = originalFileName.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;
    return folder ? `${folder}/${fileName}` : fileName;
  }

  static async uploadFile(file, folder = 'products') {
    try {
      const fileName = this.generateFileName(file.name, folder);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName); //передаем сгенерированное имя

      const response = await fetch('/api/yandex-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      return {
        fileName: result.fileName,
        publicUrl: result.publicUrl,
        size: file.size,
        contentType: file.type,
        folder,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  static async uploadMultipleFiles(files, folder = 'products') {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);//грузим в фоне
  }
}