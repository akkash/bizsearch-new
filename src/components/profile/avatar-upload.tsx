import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AvatarUpload Component
 * 
 * Allows users to upload, preview, and delete their profile avatar.
 * Features:
 * - Image preview before upload
 * - File validation (type and size)
 * - Upload progress indication
 * - Delete avatar functionality
 */
export function AvatarUpload() {
  const { profile, uploadAvatar, deleteAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (!profile?.display_name) return 'U';
    return profile.display_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 2MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const { url, error } = await uploadAvatar(file);

      if (error) throw error;

      toast.success('Avatar uploaded successfully!');
      setPreviewUrl(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
      toast.error('Failed to upload avatar');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!profile?.avatar_url) return;

    if (!confirm('Are you sure you want to delete your avatar?')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const { error } = await deleteAvatar();

      if (error) throw error;

      toast.success('Avatar deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete avatar');
      toast.error('Failed to delete avatar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || profile?.avatar_url || undefined} />
          <AvatarFallback className="text-2xl">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              getInitials()
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || deleting}
              variant="outline"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Avatar
                </>
              )}
            </Button>

            {profile?.avatar_url && (
              <Button
                onClick={handleDelete}
                disabled={uploading || deleting}
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Recommended: Square image, at least 400x400px. Max size: 2MB.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

