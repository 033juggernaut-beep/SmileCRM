"""
Unit tests for Armenian language normalizer.

Tests:
- Amount normalization: "300.000 dram", "300 hazar", "300k" -> 300000
- Currency detection: AMD tokens, RUB tokens, defaults
- Date parsing: "aysor", "vaghe", "hajord urbat", etc.
"""

import pytest
from datetime import date, timedelta

from app.services.armenian_normalizer import (
    normalize_amount,
    detect_currency,
    parse_armenian_date,
    postprocess_voice_data,
)


class TestNormalizeAmount:
    """Tests for normalize_amount function."""
    
    def test_thousands_separator_dot(self):
        """300.000 should be parsed as 300000."""
        amount, warnings = normalize_amount("300.000 dram", locale="hy")
        assert amount == 300000
        assert len(warnings) == 0
    
    def test_thousands_separator_comma(self):
        """300,000 should be parsed as 300000."""
        amount, warnings = normalize_amount("300,000 AMD", locale="hy")
        assert amount == 300000
    
    def test_armenian_hazar(self):
        """300 hazar should be parsed as 300000."""
        amount, warnings = normalize_amount("300 hazar dram", locale="hy")
        assert amount == 300000
    
    def test_english_k(self):
        """300k should be parsed as 300000."""
        amount, warnings = normalize_amount("300k", locale="en")
        assert amount == 300000
    
    def test_plain_number(self):
        """20000 should be parsed as 20000."""
        amount, warnings = normalize_amount("20000 dramov", locale="hy")
        assert amount == 20000
    
    def test_empty_string(self):
        """Empty string should return None."""
        amount, warnings = normalize_amount("", locale="hy")
        assert amount is None
    
    def test_decimal_number(self):
        """25.50 should be parsed as 25 (floor)."""
        amount, warnings = normalize_amount("25.50", locale="hy")
        assert amount == 25
    
    def test_million(self):
        """1 million should be parsed as 1000000."""
        amount, warnings = normalize_amount("1 million", locale="en")
        assert amount == 1000000
    
    def test_russian_tysyach(self):
        """50 tysyach should be parsed as 50000."""
        amount, warnings = normalize_amount("50 tysyach", locale="ru")
        assert amount == 50000


class TestDetectCurrency:
    """Tests for detect_currency function."""
    
    def test_dram_latin(self):
        """dram should be detected as AMD."""
        currency, warnings = detect_currency("300000 dram", locale="hy")
        assert currency == "AMD"
    
    def test_dram_variants(self):
        """dramov, drm, AMD should all be AMD."""
        for text in ["20000 dramov", "50 drm", "100 AMD"]:
            currency, warnings = detect_currency(text, locale="hy")
            assert currency == "AMD", f"Failed for: {text}"
    
    def test_rub_in_russian_locale(self):
        """rubles in Russian locale should be RUB."""
        currency, warnings = detect_currency("5000 ruble", locale="ru")
        assert currency == "RUB"
    
    def test_rub_in_armenian_locale(self):
        """rubles in Armenian locale should default to AMD."""
        currency, warnings = detect_currency("5000 ruble", locale="hy")
        assert currency == "AMD"
        assert len(warnings) > 0  # Should have warning
    
    def test_both_amd_and_rub(self):
        """When both AMD and RUB are found, AMD should win."""
        currency, warnings = detect_currency("300 dram rubles", locale="hy")
        assert currency == "AMD"
        assert len(warnings) > 0  # Should have warning about conflict
    
    def test_default_for_armenian(self):
        """No currency + Armenian locale should default to AMD."""
        currency, warnings = detect_currency("payment 50000", locale="hy")
        assert currency == "AMD"
    
    def test_usd_detection(self):
        """dollar should be detected as USD."""
        currency, warnings = detect_currency("100 dollars", locale="en")
        assert currency == "USD"


class TestParseArmenianDate:
    """Tests for parse_armenian_date function."""
    
    @pytest.fixture
    def today(self):
        return date(2025, 1, 6)
    
    def test_aysor_today(self, today):
        """aysor (today) should return today's date."""
        result, warnings = parse_armenian_date("vizit aysor", today, locale="hy")
        assert result == today
    
    def test_vaghe_tomorrow(self, today):
        """vaghe (tomorrow) should return tomorrow."""
        result, warnings = parse_armenian_date("galu vaghe", today, locale="hy")
        assert result == today + timedelta(days=1)
    
    def test_english_today(self, today):
        """today should return today's date."""
        result, warnings = parse_armenian_date("visit today", today, locale="en")
        assert result == today
    
    def test_english_tomorrow(self, today):
        """tomorrow should return tomorrow."""
        result, warnings = parse_armenian_date("visit tomorrow", today, locale="en")
        assert result == today + timedelta(days=1)
    
    def test_next_friday(self, today):
        """hajord urbat (next Friday) should return next Friday."""
        result, warnings = parse_armenian_date("hajord urbat", today, locale="hy")
        # Find next Friday from today (Jan 6, 2025 is Monday)
        days_until_friday = (4 - today.weekday() + 7) % 7
        if days_until_friday == 0:
            days_until_friday = 7  # Next week if today is Friday
        expected = today + timedelta(days=days_until_friday + 7)  # +7 for "next"
        assert result == expected
    
    def test_through_n_days(self, today):
        """mech 3 or (in 3 days) should return date + 3."""
        result, warnings = parse_armenian_date("mech 3 or", today, locale="hy")
        assert result == today + timedelta(days=3)
    
    def test_specific_date_format(self, today):
        """25.12 should return December 25."""
        result, warnings = parse_armenian_date("25.12", today, locale="hy")
        # Should be next year since it's past in current year
        assert result.month == 12
        assert result.day == 25
    
    def test_month_name_english(self, today):
        """January 15 should return proper date."""
        result, warnings = parse_armenian_date("15 january", today, locale="en")
        assert result.month == 1
        assert result.day == 15
    
    def test_no_date_found(self, today):
        """Text without date should return None."""
        result, warnings = parse_armenian_date("some random text", today, locale="hy")
        assert result is None


class TestPostprocessVoiceData:
    """Tests for postprocess_voice_data function."""
    
    def test_amount_normalization(self):
        """Amount should be normalized from transcript."""
        parsed = {"amount": None, "currency": None}
        result, warnings = postprocess_voice_data(
            transcript="payment 300.000 dram",
            parsed_data=parsed,
            locale="hy",
            timezone="Asia/Yerevan",
            today=date(2025, 1, 6),
        )
        assert result["amount"] == 300000
        assert result["currency"] == "AMD"
    
    def test_currency_correction(self):
        """RUB should be corrected to AMD if dram is in transcript."""
        parsed = {"amount": 50000, "currency": "RUB"}
        result, warnings = postprocess_voice_data(
            transcript="50000 dramov",
            parsed_data=parsed,
            locale="hy",
            timezone="Asia/Yerevan",
            today=date(2025, 1, 6),
        )
        assert result["currency"] == "AMD"
        assert "corrected" in str(warnings).lower() or len(warnings) > 0
    
    def test_date_from_transcript(self):
        """Date should be extracted from Armenian words."""
        parsed = {"visit_date": None}
        today = date(2025, 1, 6)
        result, warnings = postprocess_voice_data(
            transcript="vizit aysor",
            parsed_data=parsed,
            locale="hy",
            timezone="Asia/Yerevan",
            today=today,
        )
        assert result["visit_date"] == today.isoformat()
    
    def test_preserve_valid_llm_data(self):
        """Valid LLM data should be preserved."""
        parsed = {
            "visit_date": "2025-01-10",
            "amount": 20000,
            "currency": "AMD",
            "diagnosis": "Test diagnosis",
        }
        result, warnings = postprocess_voice_data(
            transcript="",
            parsed_data=parsed,
            locale="hy",
            timezone="Asia/Yerevan",
            today=date(2025, 1, 6),
        )
        assert result["visit_date"] == "2025-01-10"
        assert result["amount"] == 20000
        assert result["currency"] == "AMD"
        assert result["diagnosis"] == "Test diagnosis"
    
    def test_never_rub_when_dram_mentioned(self):
        """If dram is mentioned, never output RUB."""
        parsed = {"amount": 100000, "currency": "RUB"}
        result, warnings = postprocess_voice_data(
            transcript="100 hazar dram",
            parsed_data=parsed,
            locale="hy",
            timezone="Asia/Yerevan",
            today=date(2025, 1, 6),
        )
        assert result["currency"] == "AMD"


class TestArmenianYerevanTimezone:
    """Tests specific to Armenia/Yerevan timezone."""
    
    def test_default_currency_is_amd(self):
        """Default currency for Asia/Yerevan should be AMD."""
        currency, warnings = detect_currency(
            "payment 50000", 
            locale="hy",
            default_currency="AMD"
        )
        assert currency == "AMD"
    
    def test_aysor_returns_today(self):
        """aysor should return today in Yerevan timezone."""
        today = date(2025, 1, 6)
        result, warnings = parse_armenian_date("aysor", today, locale="hy")
        assert result == today


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

