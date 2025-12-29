"""
Unit tests for Voice AI parser - date and amount extraction
"""
import pytest
from datetime import date, timedelta
from unittest.mock import patch, MagicMock

from app.services.voice_service import (
    parse_voice_text,
    _validate_date,
    _normalize_amount,
    normalize_currency,
    correct_currency_in_text,
    VoiceParseResult,
)


class TestDateValidation:
    """Tests for date validation logic"""
    
    def test_valid_date_today(self):
        """Valid date for today should pass"""
        today = date.today()
        result, warnings = _validate_date(today.isoformat(), today)
        assert result == today.isoformat()
        assert len(warnings) == 0
    
    def test_valid_date_tomorrow(self):
        """Valid date for tomorrow should pass"""
        today = date.today()
        tomorrow = today + timedelta(days=1)
        result, warnings = _validate_date(tomorrow.isoformat(), today)
        assert result == tomorrow.isoformat()
        assert len(warnings) == 0
    
    def test_valid_date_next_week(self):
        """Date next week should pass"""
        today = date.today()
        next_week = today + timedelta(days=7)
        result, warnings = _validate_date(next_week.isoformat(), today)
        assert result == next_week.isoformat()
        assert len(warnings) == 0
    
    def test_null_date_returns_null(self):
        """None date should return None without warnings"""
        today = date.today()
        result, warnings = _validate_date(None, today)
        assert result is None
        assert len(warnings) == 0
    
    def test_empty_string_returns_null(self):
        """Empty string should return None without warnings"""
        today = date.today()
        result, warnings = _validate_date("", today)
        assert result is None
        assert len(warnings) == 0
    
    def test_invalid_format_returns_null_with_warning(self):
        """Invalid date format should return None with warning"""
        today = date.today()
        result, warnings = _validate_date("25-12-2025", today)
        assert result is None
        assert len(warnings) == 1
        assert "Неверный формат" in warnings[0]
    
    def test_date_too_far_past_rejected(self):
        """Date more than 30 days in past should be rejected"""
        today = date.today()
        old_date = today - timedelta(days=60)
        result, warnings = _validate_date(old_date.isoformat(), today)
        assert result is None
        assert len(warnings) == 1
        assert "прошлом" in warnings[0]
    
    def test_date_too_far_future_rejected(self):
        """Date more than 365 days in future should be rejected"""
        today = date.today()
        future_date = today + timedelta(days=400)
        result, warnings = _validate_date(future_date.isoformat(), today)
        assert result is None
        assert len(warnings) == 1
        assert "будущем" in warnings[0]
    
    def test_date_within_year_accepted(self):
        """Date within 365 days should be accepted"""
        today = date.today()
        future_date = today + timedelta(days=300)
        result, warnings = _validate_date(future_date.isoformat(), today)
        assert result == future_date.isoformat()
        assert len(warnings) == 0


class TestAmountNormalization:
    """Tests for amount normalization"""
    
    def test_integer_amount(self):
        """Integer should be converted to float"""
        result = _normalize_amount(20000)
        assert result == 20000.0
    
    def test_float_amount(self):
        """Float should be preserved"""
        result = _normalize_amount(20000.50)
        assert result == 20000.50
    
    def test_string_amount(self):
        """String number should be converted"""
        result = _normalize_amount("20000")
        assert result == 20000.0
    
    def test_string_with_currency_symbol(self):
        """String with currency should be cleaned"""
        result = _normalize_amount("20000 AMD")
        assert result == 20000.0
    
    def test_string_with_comma_separator(self):
        """String with comma as decimal separator"""
        result = _normalize_amount("20,50")
        assert result == 20.50
    
    def test_zero_amount_returns_none(self):
        """Zero amount should return None"""
        result = _normalize_amount(0)
        assert result is None
    
    def test_negative_amount_returns_none(self):
        """Negative amount should return None"""
        result = _normalize_amount(-100)
        assert result is None
    
    def test_none_returns_none(self):
        """None should return None"""
        result = _normalize_amount(None)
        assert result is None
    
    def test_invalid_string_returns_none(self):
        """Invalid string should return None"""
        result = _normalize_amount("abc")
        assert result is None


class TestCurrencyNormalization:
    """Tests for currency normalization (AMD/RUB detection)"""
    
    def test_dram_russian_returns_amd(self):
        """'оплатил 300000 драм' → AMD"""
        currency, text, warnings = normalize_currency(
            "оплатил 300000 драм",
            locale="ru",
            timezone="Asia/Yerevan",
        )
        assert currency == "AMD"
        assert len(warnings) == 0
    
    def test_dram_armenian_returns_amd(self):
        """'օdelays 300000 դdelays' → AMD"""
        currency, text, warnings = normalize_currency(
            "оплатил 300000 դdelays",
            locale="hy",
            timezone="Asia/Yerevan",
        )
        assert currency == "AMD"
        assert len(warnings) == 0
    
    def test_amd_explicit_returns_amd(self):
        """'оплатил 300000 AMD' → AMD"""
        currency, text, warnings = normalize_currency(
            "оплатил 300000 AMD",
            locale="ru",
            timezone="Asia/Yerevan",
        )
        assert currency == "AMD"
        assert len(warnings) == 0
    
    def test_dram_symbol_returns_amd(self):
        """'оплатил 300000 ֏' → AMD"""
        currency, text, warnings = normalize_currency(
            "оплатил 300000 ֏",
            locale="ru",
            timezone="Asia/Yerevan",
        )
        assert currency == "AMD"
        assert len(warnings) == 0
    
    def test_ruble_returns_rub(self):
        """'оплатил 300000 рублей' → RUB"""
        currency, text, warnings = normalize_currency(
            "оплатил 300000 рублей",
            locale="ru",
            timezone="Europe/Moscow",
        )
        assert currency == "RUB"
        assert len(warnings) == 0
    
    def test_mixed_dram_rub_returns_amd_with_warning(self):
        """'оплатил 300000 драм рублей' (STT garbage) → AMD + warning"""
        currency, text, warnings = normalize_currency(
            "оплатил 300000 драм рублей",
            locale="ru",
            timezone="Asia/Yerevan",
        )
        assert currency == "AMD"
        assert len(warnings) == 1
        assert "исправлена" in warnings[0].lower() or "AMD" in warnings[0]
    
    def test_no_currency_yerevan_returns_amd(self):
        """No currency but timezone=Asia/Yerevan → AMD"""
        currency, text, warnings = normalize_currency(
            "оплатил 300000",
            locale="ru",
            timezone="Asia/Yerevan",
        )
        assert currency == "AMD"
        assert len(warnings) == 0
    
    def test_no_currency_armenian_locale_returns_amd(self):
        """No currency but locale=hy → AMD"""
        currency, text, warnings = normalize_currency(
            "оплатил 300000",
            locale="hy",
            timezone="Europe/Moscow",
        )
        assert currency == "AMD"
        assert len(warnings) == 0
    
    def test_dram_variation_drama_returns_amd(self):
        """'оплатил 300000 драма' → AMD"""
        currency, text, warnings = normalize_currency(
            "оплатил 300000 драма",
            locale="ru",
            timezone="Asia/Yerevan",
        )
        assert currency == "AMD"
        assert len(warnings) == 0


class TestVoiceParserIntegration:
    """Integration tests for voice parser with mocked OpenAI"""
    
    @patch('app.services.voice_service._get_openai_client')
    def test_parse_visit_today(self, mock_get_client):
        """Test parsing 'Сегодня визит' → visit_date = today"""
        today = date.today()
        
        # Mock OpenAI response
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = f'''{{
            "visit_date": "{today.isoformat()}",
            "next_visit_date": null,
            "diagnosis": null,
            "notes": null,
            "amount": null,
            "currency": null
        }}'''
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client
        
        result = parse_voice_text(
            text="Сегодня визит",
            mode="visit",
            timezone="Asia/Yerevan",
        )
        
        assert result.visit_date == today.isoformat()
        assert len(result.warnings) == 0
    
    @patch('app.services.voice_service._get_openai_client')
    def test_parse_visit_specific_date(self, mock_get_client):
        """Test parsing specific date → visit_date = parsed date"""
        today = date.today()
        target_date = today + timedelta(days=10)
        
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = f'''{{
            "visit_date": "{target_date.isoformat()}",
            "next_visit_date": null,
            "diagnosis": "Кариес 36",
            "notes": "Боль при жевании",
            "amount": null,
            "currency": null
        }}'''
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client
        
        result = parse_voice_text(
            text="Визит на 25 декабря, кариес 36, боль при жевании",
            mode="visit",
            timezone="Asia/Yerevan",
        )
        
        assert result.visit_date == target_date.isoformat()
        assert result.diagnosis == "Кариес 36"
        assert result.notes == "Боль при жевании"
    
    @patch('app.services.voice_service._get_openai_client')
    def test_parse_payment(self, mock_get_client):
        """Test parsing payment → amount extracted"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '''{{
            "visit_date": null,
            "next_visit_date": null,
            "diagnosis": null,
            "notes": null,
            "amount": 20000,
            "currency": "AMD"
        }}'''
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client
        
        result = parse_voice_text(
            text="Оплата 20000 драм",
            mode="payment",
            timezone="Asia/Yerevan",
        )
        
        assert result.amount == 20000.0
        assert result.currency == "AMD"
    
    @patch('app.services.voice_service._get_openai_client')
    def test_parse_diagnosis(self, mock_get_client):
        """Test parsing diagnosis"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '''{{
            "visit_date": null,
            "next_visit_date": null,
            "diagnosis": "Пульпит 46",
            "notes": null,
            "amount": null,
            "currency": null
        }}'''
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client
        
        result = parse_voice_text(
            text="Диагноз: пульпит 46",
            mode="diagnosis",
            timezone="Asia/Yerevan",
        )
        
        assert result.diagnosis == "Пульпит 46"
    
    @patch('app.services.voice_service._get_openai_client')
    def test_parse_no_date_returns_null(self, mock_get_client):
        """Test that 'Новый визит' without date returns null"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '''{{
            "visit_date": null,
            "next_visit_date": null,
            "diagnosis": null,
            "notes": "Новый визит",
            "amount": null,
            "currency": null
        }}'''
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client
        
        result = parse_voice_text(
            text="Новый визит",
            mode="visit",
            timezone="Asia/Yerevan",
        )
        
        # When no explicit date is given, should return null
        assert result.visit_date is None
    
    @patch('app.services.voice_service._get_openai_client')
    def test_parse_full_visit_with_next_date(self, mock_get_client):
        """Test parsing full visit info with next visit date"""
        today = date.today()
        visit_date = today + timedelta(days=5)
        next_date = today + timedelta(days=15)
        
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = f'''{{
            "visit_date": "{visit_date.isoformat()}",
            "next_visit_date": "{next_date.isoformat()}",
            "diagnosis": null,
            "notes": "Пломба 36",
            "amount": null,
            "currency": null
        }}'''
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client
        
        result = parse_voice_text(
            text="Запиши на 25 декабря, следующий 10 января, пломба 36",
            mode="visit",
            timezone="Asia/Yerevan",
        )
        
        assert result.visit_date == visit_date.isoformat()
        assert result.next_visit_date == next_date.isoformat()
        assert result.notes == "Пломба 36"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

