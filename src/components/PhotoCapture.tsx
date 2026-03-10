/**
 * PhotoCapture Component
 * Requirements: 2.1-2.8, 16.2, 19.1
 * 
 * Allows farmers to capture or upload 2-3 crop photos
 * Shows guidelines, previews, and validates photo count
 */

import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Photo, PhotoSource } from '../types/cropGrading';

interface PhotoCaptureProps {
  onPhotosChange: (photos: Photo[]) => void;
  photos: Photo[];
  language?: string;
  maxPhotos?: number;
  minPhotos?: number;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotosChange,
  photos,
  language = 'en',
  maxPhotos = 3,
  minPhotos = 2,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const guidelines = {
    en: [
      '📷 Take clear photos in daylight',
      '📷 Place crop on plain background',
      '📷 Capture close view of crop',
      `📷 Upload ${minPhotos}-${maxPhotos} images for better accuracy`,
    ],
    hi: [
      '📷 दिन के उजाले में स्पष्ट फोटो लें',
      '📷 फसल को सादे पृष्ठभूमि पर रखें',
      '📷 फसल का करीबी दृश्य कैप्चर करें',
      `📷 बेहतर सटीकता के लिए ${minPhotos}-${maxPhotos} छवियां अपलोड करें`,
    ],
    te: [
      '📷 పగటి వెలుతురులో స్పష్టమైన ఫోటోలు తీయండి',
      '📷 పంటను సాదా నేపథ్యంపై ఉంచండి',
      '📷 పంట యొక్క దగ్గరి వీక్షణను క్యాప్చర్ చేయండి',
      `📷 మెరుగైన ఖచ్చితత్వం కోసం ${minPhotos}-${maxPhotos} చిత్రాలను అప్‌లోడ్ చేయండి`,
    ],
    ta: [
      '📷 பகல் வெளிச்சத்தில் தெளிவான புகைப்படங்களை எடுக்கவும்',
      '📷 பயிரை வெற்று பின்னணியில் வைக்கவும்',
      '📷 பயிரின் நெருக்கமான காட்சியைப் பிடிக்கவும்',
      `📷 சிறந்த துல்லியத்திற்காக ${minPhotos}-${maxPhotos} படங்களைப் பதிவேற்றவும்`,
    ],
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    source: PhotoSource
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: Photo[] = [];
    
    for (let i = 0; i < files.length && photos.length + newPhotos.length < maxPhotos; i++) {
      const file = files[i];
      const photo: Photo = {
        id: `photo-${Date.now()}-${i}`,
        uri: URL.createObjectURL(file),
        blob: file,
        timestamp: new Date(),
        source,
        size: file.size,
      };
      newPhotos.push(photo);
    }

    onPhotosChange([...photos, ...newPhotos]);
    
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter((p) => p.id !== photoId);
    onPhotosChange(updatedPhotos);
  };

  const canAddMore = photos.length < maxPhotos;
  const hasMinimum = photos.length >= minPhotos;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          {language === 'hi' && 'फोटो दिशानिर्देश'}
          {language === 'te' && 'ఫోటో మార్గదర్శకాలు'}
          {language === 'ta' && 'புகைப்பட வழிகாட்டுதல்கள்'}
          {language === 'en' && 'Photo Guidelines'}
        </h3>
        <ul className="space-y-1 text-sm text-blue-800">
          {(guidelines[language as keyof typeof guidelines] || guidelines.en).map((guideline, idx) => (
            <li key={idx}>{guideline}</li>
          ))}
        </ul>
      </div>

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {photos.map((photo) => (
            <div key={photo.id} className="relative">
              <img
                src={photo.uri}
                alt="Crop preview"
                className="w-full h-40 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                onClick={() => handleRemovePhoto(photo.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                aria-label="Remove photo"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Photo Count Status */}
      <div className="text-center mb-4">
        <span className={`text-lg font-medium ${hasMinimum ? 'text-green-600' : 'text-orange-600'}`}>
          {photos.length} / {maxPhotos} {language === 'hi' ? 'फोटो' : language === 'te' ? 'ఫోటోలు' : language === 'ta' ? 'புகைப்படங்கள்' : 'photos'}
        </span>
        {!hasMinimum && (
          <p className="text-sm text-gray-600 mt-1">
            {language === 'hi' && `कम से कम ${minPhotos} फोटो आवश्यक हैं`}
            {language === 'te' && `కనీసం ${minPhotos} ఫోటోలు అవసరం`}
            {language === 'ta' && `குறைந்தது ${minPhotos} புகைப்படங்கள் தேவை`}
            {language === 'en' && `Minimum ${minPhotos} photos required`}
          </p>
        )}
      </div>

      {/* Capture Buttons */}
      {canAddMore && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors min-h-[48px]"
          >
            <Camera size={24} />
            <span className="font-medium">
              {language === 'hi' && 'फोटो लें'}
              {language === 'te' && 'ఫోటో తీయండి'}
              {language === 'ta' && 'புகைப்படம் எடு'}
              {language === 'en' && 'Take Photo'}
            </span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors min-h-[48px]"
          >
            <Upload size={24} />
            <span className="font-medium">
              {language === 'hi' && 'गैलरी से अपलोड करें'}
              {language === 'te' && 'గ్యాలరీ నుండి అప్‌లోడ్ చేయండి'}
              {language === 'ta' && 'கேலரியிலிருந்து பதிவேற்றவும்'}
              {language === 'en' && 'Upload from Gallery'}
            </span>
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e, PhotoSource.CAMERA)}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e, PhotoSource.GALLERY)}
        className="hidden"
      />
    </div>
  );
};

export default PhotoCapture;
