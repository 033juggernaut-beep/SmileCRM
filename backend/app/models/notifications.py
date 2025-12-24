"""
Pydantic schemas for Notifications API.

Notification types:
- visit_reminder: Upcoming visit reminder
- trial_warning: Trial period expiring soon
- no_show: Patient didn't show up
- info: General system info
- birthday: Patient birthday reminder
- inactive_6m: Patient inactive for 6+ months
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


NotificationType = Literal["visit_reminder", "trial_warning", "no_show", "info", "birthday", "inactive_6m"]
NotificationStatus = Literal["unread", "read", "dismissed", "done"]


class NotificationOut(BaseModel):
    """Single notification response."""
    
    id: str
    doctor_id: str = Field(alias="doctorId")
    type: NotificationType
    title: str
    body: str | None = None
    created_at: datetime = Field(alias="createdAt")
    read_at: datetime | None = Field(default=None, alias="readAt")
    meta: dict[str, Any] | None = None
    status: NotificationStatus = "unread"
    patient_id: str | None = Field(default=None, alias="patientId")
    action_type: str | None = Field(default=None, alias="actionType")
    action_payload: dict[str, Any] | None = Field(default=None, alias="actionPayload")
    
    class Config:
        populate_by_name = True


class NotificationListOut(BaseModel):
    """Response for listing notifications."""
    
    items: list[NotificationOut]
    unread_count: int = Field(alias="unreadCount")
    
    class Config:
        populate_by_name = True


class MarkReadRequest(BaseModel):
    """Request to mark specific notifications as read."""
    
    ids: list[str] = Field(..., description="List of notification UUIDs to mark as read")


class CreateNotificationRequest(BaseModel):
    """Request to create a notification (dev/testing only)."""
    
    type: NotificationType
    title: str
    body: str | None = None
    meta: dict[str, Any] | None = None
    patient_id: str | None = Field(default=None, alias="patientId")
    action_type: str | None = Field(default=None, alias="actionType")
    action_payload: dict[str, Any] | None = Field(default=None, alias="actionPayload")
    
    class Config:
        populate_by_name = True


class UpdateNotificationRequest(BaseModel):
    """Request to update notification status."""
    
    status: NotificationStatus

