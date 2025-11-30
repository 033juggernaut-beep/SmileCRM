from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.models.dto import MediaFileResponse
from app.services import media_service, patients_service

router = APIRouter(tags=["media"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]

# Maximum file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Allowed image MIME types
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


@router.post(
    "/patients/{patient_id}/media",
    response_model=MediaFileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_patient_media(
    patient_id: str,
    current_doctor: CurrentDoctor,
    file: UploadFile = File(...),
) -> MediaFileResponse:
    """
    Upload a media file (X-ray, photo) for a patient.
    
    - **patient_id**: UUID of the patient
    - **file**: Image file (JPEG, PNG, WebP)
    
    Returns the created media file record with public URL.
    """
    # Verify patient belongs to current doctor
    patient = patients_service.get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )
    
    patient_doctor_id = patient.get("doctor_id")
    if patient_doctor_id and patient_doctor_id != current_doctor.doctor_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )
    
    # Validate file type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}",
        )
    
    # Read file content
    file_content = await file.read()
    file_size = len(file_content)
    
    # Validate file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB",
        )
    
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty",
        )
    
    # Upload file
    try:
        media_record = media_service.upload_media_file(
            patient_id=patient_id,
            doctor_id=current_doctor.doctor_id,
            file_name=file.filename or "unnamed.jpg",
            file_data=file_content,
            file_type=file.content_type or "image/jpeg",
            file_size=file_size,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(exc)}",
        ) from exc
    
    return MediaFileResponse(**media_record)


@router.get(
    "/patients/{patient_id}/media",
    response_model=list[MediaFileResponse],
)
async def list_patient_media(
    patient_id: str,
    current_doctor: CurrentDoctor,
) -> list[MediaFileResponse]:
    """
    Get all media files for a patient.
    
    - **patient_id**: UUID of the patient
    
    Returns list of media files with public URLs.
    """
    # Verify patient belongs to current doctor
    patient = patients_service.get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )
    
    patient_doctor_id = patient.get("doctor_id")
    if patient_doctor_id and patient_doctor_id != current_doctor.doctor_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )
    
    # Get media files
    media_files = media_service.list_patient_media(patient_id)
    
    return [MediaFileResponse(**media) for media in media_files]


