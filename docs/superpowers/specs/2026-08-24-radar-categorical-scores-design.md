# Radar score parameters page

Date: 2026-08-24

## Goal

Configure all radar axis formula parameters (categorical scores + soft-curve midpoints). Current hardcoded values remain defaults. Persist via `GlobalConfig`.

## Parameters

### Categorical (0–1) — Control
- `radarEffectScoreSlow` default 0.75
- `radarEffectScoreBurn` default 0
- `radarSeekScoreYes` default 1
- `radarSeekScoreNo` default 0

### Soft-curve midpoints (`halfAt`)
- Affordability: `radarHalfManaCost` 40, `radarHalfManaPerSecond` 30
- Speed: `radarHalfCastTime` 1.5
- Impact: `radarHalfTotalDamage` 40, `radarHalfDamagePerInstance` 15
- Efficiency: `radarHalfDamagePerMana` 0.8
- Control: `radarHalfChainTargets` 2, `radarHalfSplitStacks` 1
- Status: `radarHalfEffectDuration` 5, `radarHalfEffectPotency` 1.5

## UX

- Route `/radar`
- Sections per axis
- **Restore to defaults** resets all Radar-page keys above
- Axis max weights remain on Calculator

## Out of scope

Mana/second fallback when castTime is 0 (still 0.5).
