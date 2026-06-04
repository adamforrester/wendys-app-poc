import { useMemo } from 'react';
import semanticMenuJson from './data/semantic_menu_v3.json';
import type { SemanticMenu, SemanticItem, SemanticCategory } from './types';

const semanticMenu = semanticMenuJson as unknown as SemanticMenu;

/**
 * Read-only access to semantic_menu_v3.json — the LLM's view of the menu.
 *
 * This is intentionally separate from `useMenuData`:
 *   - `useMenuData` is the prototype's source of truth — drives UI, IDs, prices.
 *   - `useSemanticMenu` is the LLM's enriched view — adds aliases, voice,
 *     allergens, ingredients_text, disambiguation groups.
 *
 * IDs are shared. When Claude returns an order, we resolve names → IDs here,
 * then the bag flow uses the same `useMenuData.getProductById()` it always has.
 */
export function useSemanticMenu() {
  return useMemo(() => {
    const allItems: SemanticItem[] = semanticMenu.categories.flatMap(c => c.items);

    const itemsById = new Map<string, SemanticItem>();
    for (const item of allItems) itemsById.set(item.id, item);

    /**
     * Normalize a spoken phrase: lowercase, strip punctuation, collapse whitespace.
     * Used both when building the alias index and when resolving incoming names.
     */
    const normalize = (s: string): string =>
      s
        .toLowerCase()
        .replace(/[®™©]/g, '')
        .replace(/['']/g, '')
        .replace(/[.,!?]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    /** Index every spoken alias + canonical name back to its item. */
    const aliasIndex = new Map<string, SemanticItem>();
    for (const item of allItems) {
      aliasIndex.set(normalize(item.name), item);
      const aliases = item.voice?.spoken_names_en ?? [];
      for (const alias of aliases) {
        const norm = normalize(alias);
        // First-write wins so canonical names beat aliases on collision.
        if (!aliasIndex.has(norm)) aliasIndex.set(norm, item);
      }
    }

    /** Disambiguation group → items that share it. */
    const disambiguationGroups = new Map<string, SemanticItem[]>();
    for (const item of allItems) {
      const group = item.voice?.disambiguation_group;
      if (!group) continue;
      const existing = disambiguationGroups.get(group) ?? [];
      existing.push(item);
      disambiguationGroups.set(group, existing);
    }

    const getAllItems = (): SemanticItem[] => allItems;
    const getCategories = (): SemanticCategory[] => semanticMenu.categories;
    const getItemById = (id: string): SemanticItem | undefined => itemsById.get(id);

    /**
     * Resolve a spoken name to a single item. Returns undefined when the
     * name maps to a disambiguation group (caller should ask the user).
     */
    const resolveByName = (name: string): SemanticItem | undefined => {
      const norm = normalize(name);
      // Direct hit on canonical name or a unique alias.
      const direct = aliasIndex.get(norm);
      if (direct) return direct;

      // Last-resort fuzzy match: contains-by-word.
      const tokens = norm.split(' ').filter(Boolean);
      const candidates = allItems.filter(item =>
        tokens.every(t => normalize(item.name).includes(t))
      );
      if (candidates.length === 1) return candidates[0];
      return undefined;
    };

    const getDisambiguationOptions = (group: string): SemanticItem[] =>
      disambiguationGroups.get(group) ?? [];

    /**
     * Build a compact menu summary string for the LLM context.
     *
     * Keep it lean: category → item names + base price + a hint for combos.
     * The LLM has the full v3 file's worth of detail in its training; the
     * summary's purpose is to ground it in *this* prototype's actual IDs
     * and current item set.
     */
    const buildMenuSummary = (): string => {
      const lines: string[] = [];
      for (const cat of semanticMenu.categories) {
        if (!cat.items.length) continue;
        lines.push(`### ${cat.name}`);
        for (const item of cat.items) {
          const price = item.base_price != null ? `$${item.base_price.toFixed(2)}` : 'price TBD';
          const combo = item.isCombo ? ' [combo]' : '';
          const lto = item.isLTO ? ' [LTO]' : '';
          lines.push(`- ${item.id}: ${item.name} — ${price}${combo}${lto}`);
        }
        lines.push('');
      }
      return lines.join('\n');
    };

    return {
      getAllItems,
      getCategories,
      getItemById,
      resolveByName,
      getDisambiguationOptions,
      buildMenuSummary,
      normalize,
    };
  }, []);
}
