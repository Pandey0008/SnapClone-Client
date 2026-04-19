import { API_BASE_URL } from '../config/api';

/**
 * Upload file to server
 * @param {File} file - File to upload
 * @param {string} uploadType - Type of upload ('avatar', 'chat-attachment', 'snap', 'story')
 * @param {string} token - Auth token
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>}
 */
export const uploadFile = async (file, uploadType, token, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(JSON.parse(xhr.responseText)?.error || 'Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', `${API_BASE_URL}/api/v1/upload/${uploadType}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete file from server
 */
export const deleteFile = async (publicId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/upload/file`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ publicId })
  });

  if (!response.ok) {
    throw new Error('Failed to delete file');
  }

  return response.json();
};

/**
 * Validate file before upload
 */
export const validateFile = (file, maxSize = 50 * 1024 * 1024) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedMimes.includes(file.type)) {
    return { valid: false, error: `File type not allowed: ${file.type}` };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
  }

  return { valid: true };
};
