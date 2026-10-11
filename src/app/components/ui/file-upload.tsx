'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import type { SignupData } from '../auth/continue-registration';
import { File } from 'lucide-react';

interface FileUploadProps {
  label: string;
  name: string;
  accept?: string;
  required?: boolean;
  folder: string;
  value: string;
  setInputValue: React.Dispatch<SignupData>
}

export function FileUpload({ label, name, accept, required, folder, value, setInputValue }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUploadedUrl(value);
  }, [value]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if(file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10MB.');
      return;
    }

    setPreview(file.name);
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

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await uploadResponse.json();
      if (data.secure_url) {
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
      <Label>{label}</Label>

      <label htmlFor={name}>
        <Input
          id={name}
          name={name}
          type="file"
          accept={accept}
          required={required}
          onChange={handleUpload}
          disabled={uploading}
          className={uploadedUrl ? 'hidden' : ''}
        />

        <div className="relative mt-2 rounded-lg border overflow-hidden">
          {preview || uploadedUrl && (
            <div className='flex items-center justify-center py-5'>
              <File className='w-28 h-10' />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate py-1">{preview || 'PDF File'}</p>
              </div>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </label>

      {uploadedUrl && !uploading && (
        <p className="text-sm text-success font-medium">✓ Uploaded successfully</p>
      )}

      {error && (
        <p id='field-error' className="text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}