import apiClient from './client';
import { UploadResponse } from './types';

export const uploadApi = {
  // Upload image
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Delete image
  deleteImage: async (filename: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/upload/${filename}`);
    return response.data;
  },
};

export default uploadApi;
