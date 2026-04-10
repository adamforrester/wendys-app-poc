import { useMemo } from 'react';
import menuJson from '../data/menu.json';
import ingredientsJson from '../data/ingredients.json';
import type { Category, Product, Ingredient, AddOn, AddOnGroup } from '../data/types';

const menu = menuJson as unknown as { categories: Category[] };
const ingredients = ingredientsJson as unknown as {
  ingredients: Record<string, Ingredient>;
  productIngredientMap: Record<string, string[]>;
  addOns: Record<string, AddOn | string>;
  addOnGroups: Record<string, AddOnGroup | string>;
  productAddOnGroupMap: Record<string, string | string[]>;
  ingredientEditOverrides: Record<string, Record<string, { hasEdit: boolean }>>;
  modifierTypes: Record<string, { label: string; options: string[] }>;
};

/**
 * Read-only access to menu data — categories, products, ingredients, add-ons.
 * All data comes from static JSON. Components should never import JSON directly.
 */
export function useMenuData() {
  return useMemo(() => {
    /* ── Categories ── */

    const getAllCategories = (): Category[] => menu.categories;

    const getCategoriesByDaypart = (daypart: 'all-day' | 'breakfast'): Category[] =>
      menu.categories.filter(c => c.daypart === daypart);

    const getCategoryBySlug = (slug: string): Category | undefined =>
      menu.categories.find(c => c.slug === slug);

    const getCategoryById = (id: string): Category | undefined =>
      menu.categories.find(c => c.id === id);

    /* ── Products ── */

    const getAllProducts = (): Product[] =>
      menu.categories.flatMap(c => c.items);

    const getProductById = (id: string): Product | undefined => {
      for (const cat of menu.categories) {
        const product = cat.items.find(p => p.id === id);
        if (product) return product;
      }
      return undefined;
    };

    const getProductBySlug = (slug: string): Product | undefined => {
      for (const cat of menu.categories) {
        const product = cat.items.find(p => p.slug === slug);
        if (product) return product;
      }
      return undefined;
    };

    const getProductsByCategory = (categorySlug: string): Product[] => {
      const cat = getCategoryBySlug(categorySlug);
      return cat?.items ?? [];
    };

    const getComboProducts = (): Product[] =>
      getAllProducts().filter(p => p.isCombo);

    /* ── Ingredients for a product ── */

    // Build ID-to-ingredient lookup (ingredients are keyed by slug but referenced by ID in maps)
    const ingredientById: Record<string, Ingredient> = {};
    Object.values(ingredients.ingredients).forEach(ing => {
      ingredientById[ing.id] = ing;
    });

    const getIngredientsForProduct = (productId: string): Ingredient[] => {
      const ingredientIds = ingredients.productIngredientMap[productId];
      if (!ingredientIds) return [];
      return ingredientIds
        .map(id => ingredientById[id])
        .filter(Boolean);
    };

    const getIngredientById = (id: string): Ingredient | undefined =>
      ingredientById[id] || Object.values(ingredients.ingredients).find(i => i.id === id);

    const getIngredientBySlug = (slug: string): Ingredient | undefined =>
      ingredients.ingredients[slug];

    /** Check if ingredient has edit for a specific product (respects overrides) */
    const hasEditForProduct = (ingredientId: string, productId: string): boolean => {
      const override = ingredients.ingredientEditOverrides?.[productId]?.[ingredientId];
      if (override !== undefined) return override.hasEdit;
      const ing = ingredientById[ingredientId];
      return ing?.hasEdit ?? false;
    };

    /* ── Add-ons for a product ── */

    const getAddOnGroupsForProduct = (productId: string): { group: AddOnGroup; addOns: AddOn[] }[] => {
      const groupKeys = ingredients.productAddOnGroupMap[productId];
      if (!groupKeys) return [];

      const keys = Array.isArray(groupKeys) ? groupKeys : [groupKeys];
      return keys.map(key => {
        const group = ingredients.addOnGroups[key];
        if (!group || typeof group === 'string') return null;
        const addOns = group.addOnIds
          .map(id => {
            const addon = ingredients.addOns[id];
            return addon && typeof addon !== 'string' ? addon : null;
          })
          .filter(Boolean) as AddOn[];
        return { group, addOns };
      }).filter(Boolean) as { group: AddOnGroup; addOns: AddOn[] }[];
    };

    const getAddOnById = (id: string): AddOn | undefined => {
      const addon = ingredients.addOns[id];
      return addon && typeof addon !== 'string' ? addon : undefined;
    };

    /* ── Modifier types ── */

    const getModifierTypes = () => ingredients.modifierTypes;

    /* ── Image path helper ── */

    const getProductImagePath = (filename: string): string =>
      `/images/product-images/${filename}`;

    const getCategoryImagePath = (categorySlug: string): string =>
      `/images/category-images/category_${categorySlug}.png`;

    return {
      // Categories
      getAllCategories,
      getCategoriesByDaypart,
      getCategoryBySlug,
      getCategoryById,
      // Products
      getAllProducts,
      getProductById,
      getProductBySlug,
      getProductsByCategory,
      getComboProducts,
      // Ingredients
      getIngredientsForProduct,
      getIngredientById,
      getIngredientBySlug,
      hasEditForProduct,
      // Add-ons
      getAddOnGroupsForProduct,
      getAddOnById,
      // Modifier types
      getModifierTypes,
      // Image helpers
      getProductImagePath,
      getCategoryImagePath,
      // Raw data (for edge cases)
      categories: menu.categories,
    };
  }, []);
}
