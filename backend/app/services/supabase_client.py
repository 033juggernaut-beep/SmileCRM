from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Sequence
import uuid
from datetime import datetime

from postgrest.exceptions import APIError as PostgrestAPIError
from supabase import Client, create_client

from ..config import get_settings


class SupabaseClientError(RuntimeError):
  """Base error for all Supabase client issues."""


class SupabaseNotConfiguredError(SupabaseClientError):
  """Raised when Supabase credentials are missing or placeholders."""


class SupabaseRequestError(SupabaseClientError):
  """Raised when Supabase operations fail."""

  def __init__(self, message: str, *, original_error: Exception | None = None) -> None:
    super().__init__(message)
    self.original_error = original_error


def _is_placeholder(value: str | None) -> bool:
  if not value:
    return True
  return value in {"https://example.supabase.co", "supabase-service-role-key", "supabase-anon-key"}


settings = get_settings()

_supabase: Client | None = None
if not _is_placeholder(settings.SUPABASE_URL) and not _is_placeholder(settings.SUPABASE_SERVICE_ROLE_KEY):
  try:
    _supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
  except Exception:  # pragma: no cover - we fall back to stub client
    _supabase = None

supabase: Client | None = _supabase


@dataclass(slots=True)
class SupabaseClient:
  """Thin wrapper with typed helpers that fall back gracefully when not configured."""

  client: Client | None

  @property
  def is_configured(self) -> bool:
    return self.client is not None

  def ping(self) -> dict[str, str]:
    return {"configured": "true" if self.client else "false"}

  def select(
    self,
    table: str,
    *,
    columns: Sequence[str] | None = None,
    filters: Mapping[str, Any] | None = None,
    limit: int | None = None,
  ) -> list[dict[str, Any]]:
    client = self._client_or_raise()
    query = client.table(table).select(",".join(columns) if columns else "*")
    if filters:
      query = self._apply_filters(query, filters)
    if limit is not None:
      query = query.limit(limit)
    try:
      response = query.execute()
    except PostgrestAPIError as exc:  # pragma: no cover - network dependent
      raise SupabaseRequestError("Failed to fetch data from Supabase.", original_error=exc) from exc
    return self._extract_rows(response)

  def insert(
    self,
    table: str,
    payload: Mapping[str, Any] | Sequence[Mapping[str, Any]],
  ) -> list[dict[str, Any]]:
    client = self._client_or_raise()
    rows: list[Mapping[str, Any]]
    if isinstance(payload, Sequence) and not isinstance(payload, (str, bytes, bytearray)):
      rows = list(payload)
    else:
      rows = [payload]
    try:
      response = client.table(table).insert(rows).execute()
    except PostgrestAPIError as exc:  # pragma: no cover
      raise SupabaseRequestError("Failed to insert data into Supabase.", original_error=exc) from exc
    return self._extract_rows(response)

  def update(
    self,
    table: str,
    *,
    filters: Mapping[str, Any],
    values: Mapping[str, Any],
  ) -> list[dict[str, Any]]:
    if not filters:
      raise ValueError("Supabase update requires at least one filter.")
    client = self._client_or_raise()
    query = client.table(table).update(dict(values))
    query = self._apply_filters(query, filters)
    try:
      response = query.execute()
    except PostgrestAPIError as exc:  # pragma: no cover
      raise SupabaseRequestError("Failed to update Supabase rows.", original_error=exc) from exc
    return self._extract_rows(response)

  def _client_or_raise(self) -> Client:
    if not self.client:
      raise SupabaseNotConfiguredError("Supabase client is not configured.")
    return self.client

  def _apply_filters(self, query: Any, filters: Mapping[str, Any]) -> Any:
    for key, value in filters.items():
      if value is None:
        query = query.is_(key, "null")
      else:
        query = query.eq(key, value)
    return query

  @staticmethod
  def _extract_rows(response: Any) -> list[dict[str, Any]]:
    data = getattr(response, "data", None)
    if isinstance(data, list):
      return data
    if isinstance(data, dict):
      return [data]
    return []

  def upload_file(
    self,
    bucket: str,
    path: str,
    file_data: bytes,
    *,
    content_type: str | None = None,
  ) -> str:
    """Upload a file to Supabase Storage and return the public URL."""
    client = self._client_or_raise()
    try:
      # Upload file to storage
      options = {}
      if content_type:
        options["content-type"] = content_type
      
      response = client.storage.from_(bucket).upload(
        path=path,
        file=file_data,
        file_options=options if options else None,
      )
      
      # Get public URL
      public_url = client.storage.from_(bucket).get_public_url(path)
      return public_url
    except Exception as exc:
      raise SupabaseRequestError(
        f"Failed to upload file to storage bucket '{bucket}'.", 
        original_error=exc
      ) from exc

  def get_file_url(self, bucket: str, path: str) -> str:
    """Get the public URL for a file in Supabase Storage."""
    client = self._client_or_raise()
    return client.storage.from_(bucket).get_public_url(path)

  def delete_file(self, bucket: str, path: str) -> None:
    """Delete a file from Supabase Storage."""
    client = self._client_or_raise()
    try:
      client.storage.from_(bucket).remove([path])
    except Exception as exc:
      raise SupabaseRequestError(
        f"Failed to delete file from storage bucket '{bucket}'.", 
        original_error=exc
      ) from exc


supabase_client = SupabaseClient(client=supabase)

