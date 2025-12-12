import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

export type MediaFile = {
  id: string
  patientId: string
  doctorId: string
  fileName: string
  fileType: string
  fileSize: number
  storagePath: string
  storageBucket: string
  publicUrl: string
  createdAt?: string
}

type ApiMediaFile = {
  id: string
  patient_id: string
  doctor_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  storage_bucket: string
  public_url: string
  created_at?: string
}

const mapMediaFile = (data: ApiMediaFile): MediaFile => ({
  id: data.id,
  patientId: data.patient_id,
  doctorId: data.doctor_id,
  fileName: data.file_name,
  fileType: data.file_type,
  fileSize: data.file_size,
  storagePath: data.storage_path,
  storageBucket: data.storage_bucket,
  publicUrl: data.public_url,
  createdAt: data.created_at,
})

export const mediaApi = {
  async uploadPatientMedia(
    patientId: string,
    file: File,
  ): Promise<MediaFile> {
    const authToken = getAuthToken()

    // Create FormData for multipart/form-data upload
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiClient.post<ApiMediaFile>(
      `/patients/${patientId}/media`,
      formData,
      {
        headers: {
          ...buildAuthHeaders(authToken),
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return mapMediaFile(data)
  },

  async getPatientMedia(patientId: string): Promise<MediaFile[]> {
    const authToken = getAuthToken()

    const { data } = await apiClient.get<ApiMediaFile[]>(
      `/patients/${patientId}/media`,
      {
        headers: buildAuthHeaders(authToken),
      },
    )

    return Array.isArray(data) ? data.map(mapMediaFile) : []
  },

  async deletePatientMedia(
    patientId: string,
    mediaId: string,
  ): Promise<void> {
    const authToken = getAuthToken()

    await apiClient.delete(`/patients/${patientId}/media/${mediaId}`, {
      headers: buildAuthHeaders(authToken),
    })
  },
}
