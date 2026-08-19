import { describe, expect, it } from 'vitest';
import { defaultFeatureFlags, resolveRetro, type FeatureFlags } from './featureFlags';

/** Start from real defaults so a new flag can't silently break these cases. */
function flags(overrides: Partial<FeatureFlags> = {}): FeatureFlags {
  return { ...defaultFeatureFlags, ...overrides };
}

describe('resolveRetro', () => {
  it('resolves everything to classic when the master is off', () => {
    expect(resolveRetro(flags())).toEqual({
      topAppBar: 'classic',
      accent: 'teal',
      splash: 'current',
      accountHero: 'classic',
    });
  });

  it('resolves everything to retro when the master is on', () => {
    expect(resolveRetro(flags({ retroBranding: 'on' }))).toEqual({
      topAppBar: 'retro',
      accent: 'red',
      splash: 'retro-yellow',
      accountHero: 'retro',
    });
  });

  it('lets an explicit surface flag opt out while the master is on', () => {
    const resolved = resolveRetro(flags({ retroBranding: 'on', topAppBarStyle: 'classic' }));
    expect(resolved.topAppBar).toBe('classic');
    expect(resolved.accent).toBe('red');
  });

  it('lets an explicit surface flag opt in while the master is off', () => {
    const resolved = resolveRetro(flags({ accentColor: 'red' }));
    expect(resolved.accent).toBe('red');
    expect(resolved.topAppBar).toBe('classic');
  });

  it('honours both explicit splash variants regardless of the master', () => {
    expect(resolveRetro(flags({ splashAnimation: 'retro-newsprint' })).splash).toBe('retro-newsprint');
    expect(resolveRetro(flags({ retroBranding: 'on', splashAnimation: 'current' })).splash).toBe('current');
  });

  it('ties the account hero to the master with no override', () => {
    expect(resolveRetro(flags({ topAppBarStyle: 'classic', retroBranding: 'on' })).accountHero).toBe('retro');
    expect(resolveRetro(flags({ topAppBarStyle: 'retro' })).accountHero).toBe('classic');
  });
});
