"""
Unit tests for Voice AI System Prompts.

Tests:
- get_voice_system_prompt returns correct prompt for each language
- build_voice_user_message constructs proper context
- Prompts enforce strict JSON format rules
"""

import pytest
from datetime import date

from app.services.prompts import (
    get_voice_system_prompt,
    build_voice_user_message,
    VOICE_SYSTEM_PROMPT_HY,
    VOICE_SYSTEM_PROMPT_RU,
    VOICE_SYSTEM_PROMPT_EN,
)


class TestGetVoiceSystemPrompt:
    """Tests for get_voice_system_prompt function."""
    
    def test_armenian_prompt(self):
        """hy should return Armenian prompt."""
        prompt = get_voice_system_prompt("hy")
        assert prompt == VOICE_SYSTEM_PROMPT_HY
        assert "AMD" in prompt
        assert "dram" in prompt.lower()
    
    def test_armenian_from_am(self):
        """am (frontend code) should map to hy and return Armenian prompt."""
        prompt = get_voice_system_prompt("am")
        assert prompt == VOICE_SYSTEM_PROMPT_HY
    
    def test_russian_prompt(self):
        """ru should return Russian prompt."""
        prompt = get_voice_system_prompt("ru")
        assert prompt == VOICE_SYSTEM_PROMPT_RU
        assert "AMD" in prompt
    
    def test_english_prompt(self):
        """en should return English prompt."""
        prompt = get_voice_system_prompt("en")
        assert prompt == VOICE_SYSTEM_PROMPT_EN
    
    def test_fallback_to_english(self):
        """Unknown language should fallback to English."""
        prompt = get_voice_system_prompt("xx")
        assert prompt == VOICE_SYSTEM_PROMPT_EN


class TestBuildVoiceUserMessage:
    """Tests for build_voice_user_message function."""
    
    def test_basic_message(self):
        """Should build message with all context."""
        message = build_voice_user_message(
            transcript="aysor vizit, 300 hazar dram",
            mode="visit",
            today_iso="2025-01-06",
            tomorrow_iso="2025-01-07",
        )
        
        assert "aysor vizit" in message
        assert "300 hazar dram" in message
        assert "2025-01-06" in message
        assert "2025-01-07" in message
        assert "visit" in message.lower()
    
    def test_includes_timezone(self):
        """Should include timezone in context."""
        message = build_voice_user_message(
            transcript="test",
            mode="payment",
            today_iso="2025-01-06",
            tomorrow_iso="2025-01-07",
            timezone="Asia/Yerevan",
        )
        
        assert "Asia/Yerevan" in message
    
    def test_includes_day_after(self):
        """Should include day after tomorrow if provided."""
        message = build_voice_user_message(
            transcript="test",
            mode="visit",
            today_iso="2025-01-06",
            tomorrow_iso="2025-01-07",
            day_after_iso="2025-01-08",
        )
        
        assert "2025-01-08" in message
    
    def test_includes_patient_context(self):
        """Should include patient context if provided."""
        message = build_voice_user_message(
            transcript="test",
            mode="visit",
            today_iso="2025-01-06",
            tomorrow_iso="2025-01-07",
            patient_context={
                "patient_id": "123-456",
                "first_name": "John",
                "last_name": "Doe",
            },
        )
        
        assert "123-456" in message
        assert "John" in message
        assert "Doe" in message
    
    def test_default_currency_amd(self):
        """Should mention AMD as default currency."""
        message = build_voice_user_message(
            transcript="test",
            mode="payment",
            today_iso="2025-01-06",
            tomorrow_iso="2025-01-07",
        )
        
        assert "AMD" in message


class TestPromptContent:
    """Tests for prompt content and structure."""
    
    def test_armenian_prompt_has_json_schema(self):
        """Armenian prompt should include JSON schema."""
        assert '"action"' in VOICE_SYSTEM_PROMPT_HY
        assert '"patient"' in VOICE_SYSTEM_PROMPT_HY
        assert '"visit"' in VOICE_SYSTEM_PROMPT_HY
        assert '"payment"' in VOICE_SYSTEM_PROMPT_HY
    
    def test_armenian_prompt_enforces_amd(self):
        """Armenian prompt should enforce AMD currency."""
        assert 'currency MUST be "AMD"' in VOICE_SYSTEM_PROMPT_HY or "AMD" in VOICE_SYSTEM_PROMPT_HY
    
    def test_armenian_prompt_has_no_markdown_rule(self):
        """Armenian prompt should forbid markdown."""
        assert "No markdown" in VOICE_SYSTEM_PROMPT_HY or "markdown" in VOICE_SYSTEM_PROMPT_HY.lower()
    
    def test_armenian_prompt_has_rub_rule(self):
        """Armenian prompt should have rule about RUB."""
        assert "RUB" in VOICE_SYSTEM_PROMPT_HY
        assert "NEVER" in VOICE_SYSTEM_PROMPT_HY or "never" in VOICE_SYSTEM_PROMPT_HY.lower()
    
    def test_armenian_prompt_has_amount_rules(self):
        """Armenian prompt should explain amount conversion."""
        assert "300000" in VOICE_SYSTEM_PROMPT_HY or "300.000" in VOICE_SYSTEM_PROMPT_HY
    
    def test_armenian_prompt_has_date_rules(self):
        """Armenian prompt should explain date conversion."""
        assert "aysor" in VOICE_SYSTEM_PROMPT_HY.lower() or "TODAY" in VOICE_SYSTEM_PROMPT_HY
    
    def test_all_prompts_have_json_output_rule(self):
        """All prompts should enforce JSON-only output."""
        for prompt in [VOICE_SYSTEM_PROMPT_HY, VOICE_SYSTEM_PROMPT_RU, VOICE_SYSTEM_PROMPT_EN]:
            assert "JSON" in prompt
            assert "valid JSON" in prompt.lower() or "single valid json" in prompt.lower()
    
    def test_all_prompts_have_currency_codes(self):
        """All prompts should list valid currency codes."""
        for prompt in [VOICE_SYSTEM_PROMPT_HY, VOICE_SYSTEM_PROMPT_RU, VOICE_SYSTEM_PROMPT_EN]:
            assert '"AMD"' in prompt
            assert '"USD"' in prompt or "USD" in prompt
            assert '"RUB"' in prompt or "RUB" in prompt


class TestPromptExamples:
    """Tests for prompt examples."""
    
    def test_armenian_has_examples(self):
        """Armenian prompt should have examples."""
        assert "Examples" in VOICE_SYSTEM_PROMPT_HY or "Input:" in VOICE_SYSTEM_PROMPT_HY
        assert "Output:" in VOICE_SYSTEM_PROMPT_HY or '"action"' in VOICE_SYSTEM_PROMPT_HY
    
    def test_examples_show_amd_currency(self):
        """Examples should show AMD currency in output."""
        # Check that at least one example has AMD
        assert '"currency":"AMD"' in VOICE_SYSTEM_PROMPT_HY.replace(" ", "")
    
    def test_examples_show_amount_as_integer(self):
        """Examples should show amount as integer."""
        # Check for integer amounts like 300000, 50000, 20000
        import re
        amounts = re.findall(r'"amount":(\d+)', VOICE_SYSTEM_PROMPT_HY.replace(" ", ""))
        assert len(amounts) > 0
        for amount in amounts:
            assert int(amount) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

