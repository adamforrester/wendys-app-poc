import { useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';

/**
 * Voice Ordering home banner — replaces the FAB as the entry point into
 * `/voice`. Mounted on Home today; will also land on Menu next.
 *
 * Design: Figma 1867:20559 (Wendy's COR Tickets file). Red brand bg, white
 * speaker icon, two-line copy, white "Try Now" pill in teal text. Uses
 * the existing Button component for the CTA so the type ramp + min-width
 * + radius stay token-driven.
 *
 * The whole tile is the click target — the inner Button is decorative
 * and pointer-events:none so a tap anywhere on the banner navigates
 * once. Hidden when the voiceOrdering flag is `off`.
 */
export function VoiceOrderingBanner() {
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();

  if (flags.voiceOrdering === 'off') return null;

  const handlePress = () => navigate('/voice');

  return (
    <button
      type="button"
      onClick={handlePress}
      aria-label="Voice Ordering Now Available — try our new AI voice assistant"
      className="w-full flex items-center justify-between bg-[var(--color-bg-brand-primary-default)] rounded-wds-s pl-wds-12 pr-wds-12 py-wds-8 border-0 cursor-pointer text-left"
    >
      {/* Speaker icon — same SVG used by the legacy FAB, mask-tinted to
          the inverse text token so it inherits dark-mode shifts cleanly. */}
      <span
        aria-hidden="true"
        className="inline-block flex-shrink-0"
        style={{
          width: 32,
          height: 32,
          backgroundColor: 'var(--color-icon-onbrand-default)',
          maskImage: 'url(/icons/voice.svg)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: 'url(/icons/voice.svg)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />

      {/* Fixed text width per Figma (187px). The wrapper pads spaces left
          and right of this column via the parent's justify-between, so we
          don't add gap utilities here. */}
      <div className="flex flex-col flex-shrink-0 text-[var(--color-text-onbrand-default)]" style={{ width: 187 }}>
        <span className="font-display font-bold text-[12px] leading-[16px] whitespace-nowrap">
          Voice Ordering Now Available
        </span>
        <span className="font-normal text-[12px] leading-[16px] tracking-[-0.06px]">
          Try our new AI voice assistant to help you build orders faster.
        </span>
      </div>

      {/* Decorative pill — the wrapping <button> handles the press.
          The shared Button (size=small) has a 96px min-width AND the
          standard small-button x-padding of 24, which together render
          ~118px wide. The Figma calls for an exact 96px pill, so we
          render a tokens-only inline pill matching that footprint. */}
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center bg-[var(--color-bg-onbrand-default)] rounded-wds-full font-display font-bold text-[14px] leading-[20px] text-[var(--color-text-brand-secondary-default)]"
        style={{ width: 96, height: 32, pointerEvents: 'none' }}
      >
        Try Now
      </span>
    </button>
  );
}
