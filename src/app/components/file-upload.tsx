'use client';
import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import type { SignupData } from './auth/continue-registration';
import { FileBadge } from 'lucide-react';

interface FileUploadProps {
  label: string;
  name: string;
  accept?: string;
  required?: boolean;
  folder: string;
  setInputValue: React.Dispatch<SignupData>
}

export function FileUpload({ label, name, accept, required, folder, setInputValue }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    fileName: string;
    fileType: string
    fileSize: number
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if(file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10MB.');
      return;
    }

    setFileDetails({
      fileName: file.name,
      fileType: file.type.includes('application/pdf') ? 'doc' : 'image',
      fileSize: file.size
    });
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);

    setUploading(true);
    setError(null);

    try {
      const signatureResponse = await fetch('/api/cloud/get-upload-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });

      if (!signatureResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const { signature, timestamp, cloudName, apiKey } = await signatureResponse.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      const endpointType = file.type.includes('application/pdf') ? 'raw' : 'image';
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${endpointType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await uploadResponse.json();

      if (data.secure_url) {
        setUploadedUrl(data.secure_url);
        setInputValue({ type: name as SignupData['type'], value: data.secure_url });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <Input
        id={name}
        name={name}
        type="file"
        accept={accept}
        required={required}
        onChange={handleUpload}
        disabled={uploading}
      />

      {previewUrl && (
        <div className="relative mt-2 rounded-lg border overflow-hidden">
          {fileDetails && fileDetails.fileType === 'doc' ?
            <div className='flex items-center justify-center py-5'>
              <FileBadge className='w-28 h-10' />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileDetails.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {(fileDetails.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div> :
            <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover" />
          }
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {uploadedUrl && !uploading && (
        <p className="text-sm text-success font-medium">✓ Uploaded successfully</p>
      )}

      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}