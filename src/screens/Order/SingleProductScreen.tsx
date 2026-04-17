import { useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TransparentTopBar } from '../../components/TransparentTopBar/TransparentTopBar';
import { MediumTopAppBar } from '../../components/MediumTopAppBar/MediumTopAppBar';
import { HeroImage } from '../../components/HeroImage/HeroImage';
import { ProductHeader } from '../../components/ProductHeader/ProductHeader';
import { SectionHeader } from '../../components/SectionHeader/SectionHeader';
import { IngredientCard } from '../../components/IngredientCard/IngredientCard';
import { IngredientCollapse } from '../../components/IngredientCollapse/IngredientCollapse';
import { IngredientTable } from '../../components/IngredientTable/IngredientTable';
import { Tabs } from '../../components/Tabs/Tabs';
import { ListRow } from '../../components/ListRow/ListRow';
import { Chip } from '../../components/Chip/Chip';
import { RadioButton } from '../../components/RadioButton/RadioButton';
import { OrderBar } from '../../components/OrderBar/OrderBar';
import { Dialog } from '../../components/Dialog/Dialog';
import { useMenuData } from '../../hooks/useMenuData';

/* ── Ingredient name → image path resolver ── */
const ingredientImageMap: Record<string, string> = {
  'Potato Bun': '/images/ingredient-images/premium-bun.png',
  'American Cheese Slice': '/images/ingredient-images/american-cheese-slice.png',
  'Ketchup': '/images/ingredient-images/ketchup-image.png',
  'Mayonnaise': '/images/ingredient-images/mayonnaise-image.png',
  'Crinkle Cut Pickles': '/images/ingredient-images/pickles-image.png',
  'Hamburger Patty': '/images/ingredient-images/patty.png',
  'Lettuce': '/images/ingredient-images/lettuce-image.png',
  'Sweet Onion': '/images/ingredient-images/onion.png',
  'Tomato': '/images/ingredient-images/tomato-image.png',
  'Mustard': '/images/ingredient-images/mustard-image.png',
  'Applewood Smoked Bacon': '/images/ingredient-images/applewood-smoked-bacon.png',
  'Crispy Onions': '/images/ingredient-images/crispy-onions.png',
  'Cheese Sauce': '/images/ingredient-images/cheese-ramekin.png',
  'Biscuit': '/images/ingredient-images/premium-bun.png',
  'Egg': '/images/ingredient-images/american-cheese-slice.png',
  'Sausage Patty': '/images/ingredient-images/patty.png',
  'Croissant Bun': '/images/ingredient-images/premium-bun.png',
  'Swiss Cheese': '/images/ingredient-images/american-cheese-slice.png',
  'Chicken Breast': '/images/ingredient-images/grilled-chicken-breast.png',
  'Spicy Chicken Breast': '/images/ingredient-images/spicy-chicken-breast.png',
  'Ranch Sauce': '/images/sauces-dressings/creamy-ranch-sauce.png',
  'Asiago Ranch Sauce': '/images/sauces-dressings/creamy-ranch-sauce.png',
  'Maple Honey Butter Spread': '/images/ingredient-images/mayonnaise-image.png',
  'Breakfast Chicken': '/images/ingredient-images/grilled-chicken-breast.png',
};

const addOnImageMap: Record<string, string> = {
  'Applewood Smoked Bacon': '/images/ingredient-images/applewood-smoked-bacon.png',
  'American Cheese Slice': '/images/ingredient-images/american-cheese-slice.png',
  'Asiago Cheese': '/images/ingredient-images/american-cheese-slice.png',
  "Wendy's Signature Dipping Sauce": '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png',
  "Scorchin' Hot Dipping Sauce": '/images/sauces-dressings/ghost-pepper.png',
  'Sweet Chili Dipping Sauce': '/images/sauces-dressings/creamy-sriracha.png',
  'Honey Mustard Dipping Sauce': '/images/sauces-dressings/honey-mustard-ramekin.png',
  'Creamy Ranch Dipping Sauce': '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png',
  'Honey BBQ Dipping Sauce': '/images/sauces-dressings/honey-bbq-sauce-ramekin.png',
  'Egg': '/images/ingredient-images/american-cheese-slice.png',
  'Sausage Patty': '/images/ingredient-images/patty.png',
  'Swiss Cheese Sauce': '/images/sauces-dressings/cheese-ramekin.png',
};

function getIngredientImage(name: string): string {
  return ingredientImageMap[name] || '/images/fallback.png';
}

function getAddOnImage(name: string): string {
  return addOnImageMap[name] || '/images/fallback.png';
}

/** Determine modifier type for an add-on based on its category/characteristics */
type AddOnModifier = 'chips' | 'counter' | 'none';

const quantityStepperAddOns = new Set([
  'Applewood Smoked Bacon',
  'American Cheese Slice',
  'Egg',
  'Sausage Patty',
  'Extra Beef Patty',
  'Avocado',
]);

const amountChipAddOns = new Set([
  'Asiago Cheese',
  'Swiss Cheese Sauce',
  'Jalapeños',
]);

function getAddOnModifierType(name: string): AddOnModifier {
  if (quantityStepperAddOns.has(name)) return 'counter';
  if (amountChipAddOns.has(name)) return 'chips';
  // Sauces get counter too (up to 2)
  if (name.includes('Sauce') || name.includes('BBQ')) return 'counter';
  return 'none';
}

const amountChipOptions = [
  { id: 'lite', label: 'Lite' },
  { id: 'reg', label: 'Reg' },
  { id: 'xtra', label: 'Xtra' },
];

/* ── Size selector configuration ── */
const sizableCategories = new Set(['beverages', 'coffee', 'frosty']);

/** Products that don't get a size selector despite being in a sizable category */
const noSizeProducts = new Set([
  'Pure Life Bottled Water', 'Honest Kids Fruit Punch', 'Simply Orange Juice',
  'Chocolate Milk', 'Milk',
]);

const standardSizes = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const frostySizes = [
  { id: 'junior', label: 'Junior' },
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

function isFrostyProduct(slug: string): boolean {
  return slug === 'frosty';
}

/* ── Frosty per-product ingredients ("What's On It") ── */
const frostyIngredients: Record<string, { name: string; image: string }[]> = {
  // Girl Scout Thin Mints Fusions
  'Girl Scout Thin Mints Vanilla Frosty Fusion': [
    { name: 'Crushed Girl Scout Thin Mints', image: '/images/ingredient-images/crushed-thin-mints.webp' },
    { name: 'Minty Cookie Crumble Sauce', image: '/images/ingredient-images/minty-cookie-crumble-sauce.webp' },
  ],
  'Girl Scout Thin Mints Chocolate Frosty Fusion': [
    { name: 'Crushed Girl Scout Thin Mints', image: '/images/ingredient-images/crushed-thin-mints.webp' },
    { name: 'Minty Cookie Crumble Sauce', image: '/images/ingredient-images/minty-cookie-crumble-sauce.webp' },
  ],
  // OREO Brownie Fusions
  'OREO Brownie Vanilla Frosty Fusion': [
    { name: 'OREO Cookie Pieces', image: '/images/ingredient-images/oreo-cookie-pieces.webp' },
    { name: 'Brownie Batter Sauce', image: '/images/ingredient-images/brownie-batter-sauce.webp' },
  ],
  'OREO Brownie Chocolate Frosty Fusion': [
    { name: 'OREO Cookie Pieces', image: '/images/ingredient-images/oreo-cookie-pieces.webp' },
    { name: 'Brownie Batter Sauce', image: '/images/ingredient-images/brownie-batter-sauce.webp' },
  ],
  // Caramel Crunch Fusions
  'Caramel Crunch Vanilla Frosty Fusion': [
    { name: 'Toffee Pieces', image: '/images/ingredient-images/toffee-pieces.webp' },
    { name: 'Caramel Sauce', image: '/images/ingredient-images/caramel-sauce.webp' },
  ],
  'Caramel Crunch Chocolate Frosty Fusion': [
    { name: 'Toffee Pieces', image: '/images/ingredient-images/toffee-pieces.webp' },
    { name: 'Caramel Sauce', image: '/images/ingredient-images/caramel-sauce.webp' },
  ],
  // Girl Scout Thin Mints Swirls
  'Girl Scout Thin Mints Vanilla Frosty Swirl': [
    { name: 'Minty Cookie Crumble Sauce', image: '/images/ingredient-images/minty-cookie-crumble-sauce.webp' },
  ],
  'Girl Scout Thin Mints Chocolate Frosty Swirl': [
    { name: 'Minty Cookie Crumble Sauce', image: '/images/ingredient-images/minty-cookie-crumble-sauce.webp' },
  ],
  // Brownie Batter Swirls
  'Brownie Batter Vanilla Frosty Swirl': [
    { name: 'Brownie Batter Sauce', image: '/images/ingredient-images/brownie-batter-sauce.webp' },
  ],
  'Brownie Batter Chocolate Frosty Swirl': [
    { name: 'Brownie Batter Sauce', image: '/images/ingredient-images/brownie-batter-sauce.webp' },
  ],
  // Strawberry Swirls
  'Strawberry Vanilla Frosty Swirl': [
    { name: 'Strawberry Puree', image: '/images/ingredient-images/strawberry-puree.webp' },
  ],
  'Strawberry Chocolate Frosty Swirl': [
    { name: 'Strawberry Puree', image: '/images/ingredient-images/strawberry-puree.webp' },
  ],
  // Caramel Swirls
  'Caramel Vanilla Frosty Swirl': [
    { name: 'Caramel Sauce', image: '/images/ingredient-images/caramel-sauce.webp' },
  ],
  'Caramel Chocolate Frosty Swirl': [
    { name: 'Caramel Sauce', image: '/images/ingredient-images/caramel-sauce.webp' },
  ],
};

/* ── Frosty per-product add extras ── */
interface FrostyAddOn {
  id: string;
  name: string;
  price: number;
  image: string;
}

const frostyAddExtras: Record<string, FrostyAddOn[]> = {
  'Girl Scout Thin Mints Vanilla Frosty Fusion': [
    { id: 'fx_minty', name: 'Extra Minty Cookie Crumble Sauce', price: 0.50, image: '/images/ingredient-images/minty-cookie-crumble-sauce.webp' },
    { id: 'fx_mints', name: 'Extra Crushed Girl Scout Thin Mints', price: 1.20, image: '/images/ingredient-images/crushed-thin-mints.webp' },
  ],
  'Girl Scout Thin Mints Chocolate Frosty Fusion': [
    { id: 'fx_minty', name: 'Extra Minty Cookie Crumble Sauce', price: 0.50, image: '/images/ingredient-images/minty-cookie-crumble-sauce.webp' },
    { id: 'fx_mints', name: 'Extra Crushed Girl Scout Thin Mints', price: 1.20, image: '/images/ingredient-images/crushed-thin-mints.webp' },
  ],
  'OREO Brownie Vanilla Frosty Fusion': [
    { id: 'fx_brownie', name: 'Extra Brownie Batter Sauce', price: 0.50, image: '/images/ingredient-images/brownie-batter-sauce.webp' },
    { id: 'fx_oreo', name: 'Extra OREO Cookie Pieces', price: 1.20, image: '/images/ingredient-images/oreo-cookie-pieces.webp' },
  ],
  'OREO Brownie Chocolate Frosty Fusion': [
    { id: 'fx_brownie', name: 'Extra Brownie Batter Sauce', price: 0.50, image: '/images/ingredient-images/brownie-batter-sauce.webp' },
    { id: 'fx_oreo', name: 'Extra OREO Cookie Pieces', price: 1.20, image: '/images/ingredient-images/oreo-cookie-pieces.webp' },
  ],
  'Caramel Crunch Vanilla Frosty Fusion': [
    { id: 'fx_caramel', name: 'Extra Caramel Sauce', price: 0.50, image: '/images/ingredient-images/caramel-sauce.webp' },
    { id: 'fx_toffee', name: 'Extra Toffee Pieces', price: 1.20, image: '/images/ingredient-images/toffee-pieces.webp' },
  ],
  'Caramel Crunch Chocolate Frosty Fusion': [
    { id: 'fx_caramel', name: 'Extra Caramel Sauce', price: 0.50, image: '/images/ingredient-images/caramel-sauce.webp' },
    { id: 'fx_toffee', name: 'Extra Toffee Pieces', price: 1.20, image: '/images/ingredient-images/toffee-pieces.webp' },
  ],
  // Swirls get 1 add extra matching their sauce
  'Brownie Batter Vanilla Frosty Swirl': [
    { id: 'fx_brownie', name: 'Extra Brownie Batter Sauce', price: 0.50, image: '/images/ingredient-images/brownie-batter-sauce.webp' },
  ],
  'Brownie Batter Chocolate Frosty Swirl': [
    { id: 'fx_brownie', name: 'Extra Brownie Batter Sauce', price: 0.50, image: '/images/ingredient-images/brownie-batter-sauce.webp' },
  ],
  'Strawberry Vanilla Frosty Swirl': [
    { id: 'fx_straw', name: 'Extra Strawberry Puree', price: 0.50, image: '/images/ingredient-images/strawberry-puree.webp' },
  ],
  'Strawberry Chocolate Frosty Swirl': [
    { id: 'fx_straw', name: 'Extra Strawberry Puree', price: 0.50, image: '/images/ingredient-images/strawberry-puree.webp' },
  ],
  'Caramel Vanilla Frosty Swirl': [
    { id: 'fx_caramel', name: 'Extra Caramel Sauce', price: 0.50, image: '/images/ingredient-images/caramel-sauce.webp' },
  ],
  'Caramel Chocolate Frosty Swirl': [
    { id: 'fx_caramel', name: 'Extra Caramel Sauce', price: 0.50, image: '/images/ingredient-images/caramel-sauce.webp' },
  ],
};

/* ── Freestyle flavor options with real images ── */
const freestyleFlavors = [
  { id: 'none', label: 'No Flavor', image: '/images/ccfs-flavors/no-flavor.png' },
  { id: 'cherry', label: 'cherry', image: '/images/ccfs-flavors/cherry.png' },
  { id: 'vanilla', label: 'vanilla', image: '/images/ccfs-flavors/vanilla.png' },
  { id: 'cherry-vanilla', label: 'cherry vanilla', image: '/images/ccfs-flavors/cherry-vanilla.png' },
  { id: 'lime', label: 'lime', image: '/images/ccfs-flavors/lime.png' },
  { id: 'raspberry', label: 'raspberry', image: '/images/ccfs-flavors/raspberry.png' },
];

function isFreestyle(name: string): boolean {
  return name.toLowerCase().includes('freestyle');
}

/* ── Cold brew "What's On It" ingredient config ── */
const coldBrewIngredients: Record<string, { name: string; image: string }[]> = {
  'Vanilla Cold Brew With Cream': [
    { name: 'Creamer', image: '/images/ingredient-images/creamer.png' },
    { name: 'Vanilla Syrup', image: '/images/fallback.png' },
  ],
  'Caramel Cold Brew With Cream': [
    { name: 'Creamer', image: '/images/ingredient-images/creamer.png' },
    { name: 'Caramel Syrup', image: '/images/ingredient-images/caramel-syrup.png' },
  ],
  'Chocolate Cold Brew With Cream': [
    { name: 'Creamer', image: '/images/ingredient-images/creamer.png' },
    { name: 'Chocolate Syrup', image: '/images/ingredient-images/chocolate-syrup.png' },
  ],
  'Cold Brew With Cream And Sugar': [
    { name: 'Creamer', image: '/images/ingredient-images/creamer.png' },
    { name: 'Cane Syrup', image: '/images/ingredient-images/cane-syrup.png' },
  ],
};

/* ── Salad dressing configuration (included accompaniment) ── */
interface IncludedAccompaniment {
  name: string;
  calories: string;
  image: string;
}

const saladDressings: Record<string, IncludedAccompaniment> = {
  'Apple Pecan Salad': { name: 'Pomegranate Vinaigrette', calories: '120 cal', image: '/images/sauces-dressings/pomegranate-vinaigrette.png' },
  'Parmesan Caesar Salad': { name: 'Caesar Dressing', calories: '180 cal', image: '/images/sauces-dressings/caesar.png' },
  'Cobb Salad': { name: 'Ranch Dressing', calories: '250 cal', image: '/images/sauces-dressings/buttermilk-ranch.png' },
  'Taco Salad': { name: 'Creamy Salsa Dressing', calories: '160 cal', image: '/images/sauces-dressings/creamy-salsa.png' },
};

/* ── Salad per-product ingredients ── */
const saladIngredients: Record<string, { name: string; image: string }[]> = {
  'Apple Pecan Salad': [
    { name: 'Grilled Chicken', image: '/images/ingredient-images/grilled-chicken-breast.png' },
    { name: 'Roasted Pecans', image: '/images/ingredient-images/roasted-pecans.png' },
    { name: 'Candied Almonds', image: '/images/ingredient-images/candied-almonds.png' },
  ],
  'Parmesan Caesar Salad': [
    { name: 'Grilled Chicken', image: '/images/ingredient-images/grilled-chicken-breast.png' },
    { name: 'Parmesan Crisps', image: '/images/ingredient-images/parmesan-crisps.png' },
    { name: 'Shredded Parmesan', image: '/images/ingredient-images/shredded-cheddar-cheese.png' },
  ],
  'Cobb Salad': [
    { name: 'Grilled Chicken', image: '/images/ingredient-images/grilled-chicken-breast.png' },
    { name: 'Applewood Smoked Bacon', image: '/images/ingredient-images/applewood-smoked-bacon.png' },
    { name: 'American Cheese', image: '/images/ingredient-images/american-cheese-slice.png' },
  ],
  'Taco Salad': [
    { name: 'Seasoned Beef', image: '/images/ingredient-images/patty.png' },
    { name: 'Shredded Cheddar', image: '/images/ingredient-images/shredded-cheddar-cheese.png' },
    { name: 'Taco Chips', image: '/images/ingredient-images/taco-chips.png' },
  ],
};

/* ── Fries & Sides per-product ingredients ── */
const friesSidesIngredients: Record<string, { name: string; image: string }[]> = {
  // Baked potatoes
  'Sour Cream And Chive Baked Potato': [
    { name: 'Sour Cream', image: '/images/ingredient-images/light-sour-cream.png' },
    { name: 'Chives', image: '/images/fallback.png' },
  ],
  'Bacon Cheese Baked Potato': [
    { name: 'Applewood Smoked Bacon', image: '/images/ingredient-images/applewood-smoked-bacon.png' },
    { name: 'Cheese Sauce', image: '/images/sauces-dressings/cheese-ramekin.png' },
  ],
  'Chili Cheese Baked Potato': [
    { name: 'Chili', image: '/images/sauces-dressings/chili.png' },
    { name: 'Cheese Sauce', image: '/images/sauces-dressings/cheese-ramekin.png' },
  ],
  'Cheese Baked Potato': [
    { name: 'Cheese Sauce', image: '/images/sauces-dressings/cheese-ramekin.png' },
  ],
  'Plain Baked Potato': [],
  // Topped fries
  'Baconator Fries': [
    { name: 'Applewood Smoked Bacon', image: '/images/ingredient-images/applewood-smoked-bacon.png' },
    { name: 'Cheddar Cheese Sauce', image: '/images/sauces-dressings/cheese-ramekin.png' },
    { name: 'Shredded Cheddar Cheese', image: '/images/ingredient-images/shredded-cheddar-cheese.png' },
    { name: 'Salt', image: '/images/ingredient-images/sea-salt.png' },
  ],
  'Chili Cheese Fries': [
    { name: 'Chili', image: '/images/sauces-dressings/chili.png' },
    { name: 'Shredded Cheddar Cheese', image: '/images/ingredient-images/shredded-cheddar-cheese.png' },
    { name: 'Salt', image: '/images/ingredient-images/sea-salt.png' },
    { name: 'Cheddar Cheese Sauce', image: '/images/sauces-dressings/cheese-ramekin.png' },
  ],
  'Cheese Fries': [
    { name: 'Salt', image: '/images/ingredient-images/sea-salt.png' },
    { name: 'Shredded Cheddar Cheese', image: '/images/ingredient-images/shredded-cheddar-cheese.png' },
    { name: 'Cheddar Cheese Sauce', image: '/images/sauces-dressings/cheese-ramekin.png' },
  ],
  // French fries
  'French Fries': [
    { name: 'Salt', image: '/images/ingredient-images/sea-salt.png' },
  ],
  // Chili
  'Chili': [
    { name: 'Saltine Crackers', image: '/images/fallback.png' },
  ],
  'Family Chili': [
    { name: 'Saltine Crackers', image: '/images/fallback.png' },
  ],
};

/* ── Fries & Sides per-product add extras ── */
const friesSidesAddExtras: Record<string, FrostyAddOn[]> = {
  'Sour Cream And Chive Baked Potato': [
    { id: 'bp_chili', name: 'Chili', price: 0.60, image: '/images/sauces-dressings/chili.png' },
    { id: 'bp_butter', name: 'Buttery Spread', price: 0, image: '/images/fallback.png' },
    { id: 'bp_salt', name: 'Sea Salt & Black Pepper', price: 0, image: '/images/ingredient-images/sea-salt.png' },
  ],
  'Bacon Cheese Baked Potato': [
    { id: 'bp_chili', name: 'Chili', price: 0.60, image: '/images/sauces-dressings/chili.png' },
    { id: 'bp_sour', name: 'Sour Cream', price: 0, image: '/images/ingredient-images/light-sour-cream.png' },
    { id: 'bp_butter', name: 'Buttery Spread', price: 0, image: '/images/fallback.png' },
  ],
  'Chili Cheese Baked Potato': [
    { id: 'bp_sour', name: 'Sour Cream', price: 0, image: '/images/ingredient-images/light-sour-cream.png' },
    { id: 'bp_butter', name: 'Buttery Spread', price: 0, image: '/images/fallback.png' },
  ],
  'Cheese Baked Potato': [
    { id: 'bp_chili', name: 'Chili', price: 0.60, image: '/images/sauces-dressings/chili.png' },
    { id: 'bp_sour', name: 'Sour Cream', price: 0, image: '/images/ingredient-images/light-sour-cream.png' },
    { id: 'bp_butter', name: 'Buttery Spread', price: 0, image: '/images/fallback.png' },
  ],
  'Chili': [
    { id: 'ch_hot', name: 'Hot Sauce', price: 0, image: '/images/sauces-dressings/ghost-pepper.png' },
    { id: 'ch_sour', name: 'Sour Cream', price: 0, image: '/images/ingredient-images/light-sour-cream.png' },
  ],
  'Family Chili': [
    { id: 'ch_hot', name: 'Hot Sauce', price: 0, image: '/images/sauces-dressings/ghost-pepper.png' },
    { id: 'ch_sour', name: 'Sour Cream', price: 0, image: '/images/ingredient-images/light-sour-cream.png' },
  ],
  // Topped fries + French fries — dipping sauces
  'Baconator Fries': [
    { id: 'fs_sig', name: "Wendy's Signature Dipping Sauce", price: 0.50, image: '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png' },
    { id: 'fs_scorch', name: "Scorchin' Hot Dipping Sauce", price: 0.50, image: '/images/sauces-dressings/ghost-pepper.png' },
    { id: 'fs_sweet', name: 'Sweet Chili Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/sweet-chili-ramekin.png' },
    { id: 'fs_honey_m', name: 'Honey Mustard Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/honey-mustard-ramekin.png' },
    { id: 'fs_ranch', name: 'Creamy Ranch Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png' },
    { id: 'fs_bbq', name: 'Honey BBQ Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/honey-bbq-sauce-ramekin.png' },
  ],
  'Chili Cheese Fries': [
    { id: 'fs_sig', name: "Wendy's Signature Dipping Sauce", price: 0.50, image: '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png' },
    { id: 'fs_scorch', name: "Scorchin' Hot Dipping Sauce", price: 0.50, image: '/images/sauces-dressings/ghost-pepper.png' },
    { id: 'fs_sweet', name: 'Sweet Chili Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/sweet-chili-ramekin.png' },
    { id: 'fs_honey_m', name: 'Honey Mustard Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/honey-mustard-ramekin.png' },
    { id: 'fs_ranch', name: 'Creamy Ranch Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png' },
    { id: 'fs_bbq', name: 'Honey BBQ Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/honey-bbq-sauce-ramekin.png' },
  ],
  'Cheese Fries': [
    { id: 'fs_sig', name: "Wendy's Signature Dipping Sauce", price: 0.50, image: '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png' },
    { id: 'fs_scorch', name: "Scorchin' Hot Dipping Sauce", price: 0.50, image: '/images/sauces-dressings/ghost-pepper.png' },
    { id: 'fs_sweet', name: 'Sweet Chili Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/sweet-chili-ramekin.png' },
    { id: 'fs_honey_m', name: 'Honey Mustard Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/honey-mustard-ramekin.png' },
    { id: 'fs_ranch', name: 'Creamy Ranch Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png' },
    { id: 'fs_bbq', name: 'Honey BBQ Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/honey-bbq-sauce-ramekin.png' },
  ],
  'French Fries': [
    { id: 'fs_sig', name: "Wendy's Signature Dipping Sauce", price: 0.50, image: '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png' },
    { id: 'fs_scorch', name: "Scorchin' Hot Dipping Sauce", price: 0.50, image: '/images/sauces-dressings/ghost-pepper.png' },
    { id: 'fs_sweet', name: 'Sweet Chili Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/sweet-chili-ramekin.png' },
    { id: 'fs_honey_m', name: 'Honey Mustard Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/honey-mustard-ramekin.png' },
    { id: 'fs_ranch', name: 'Creamy Ranch Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/creamy-ranch-sauce-ramekin.png' },
    { id: 'fs_bbq', name: 'Honey BBQ Dipping Sauce', price: 0.50, image: '/images/sauces-dressings/honey-bbq-sauce-ramekin.png' },
  ],
};

/** Products in fries-sides that get the 4-size selector */
const friesSizeProducts = new Set(['French Fries']);

/* ── Nugget/Tender sauce accompaniment ── */
const nuggetSauceAccompaniment: IncludedAccompaniment = {
  name: 'Honey BBQ Dipping Sauce (x2)',
  calories: '70 Cal',
  image: '/images/sauces-dressings/honey-bbq-sauce-ramekin.png',
};

const nuggetTenderNames = new Set([
  '4 Pc. Chicken Nuggets', '6 Pc. Chicken Nuggets', '10 Pc. Chicken Nuggets',
  '4 Pc. Spicy Chicken Nuggets', '6 Pc. Spicy Chicken Nuggets', '10 Pc. Spicy Chicken Nuggets',
  'Nuggs Party Pack',
  '3 Pc. Tenders', '4 Pc. Tenders',
]);

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function formatCalories(cal: { min: number; max: number }): string {
  if (cal.min === cal.max) return `${cal.min} Cal`;
  return `${cal.min}/${cal.max} Cal`;
}

/* ── Mock nutrition data ── */
function getMockNutrition(calories: number) {
  return [
    { label: 'Calories', value: String(calories) },
    { label: 'Total Fat', value: `${Math.round(calories * 0.04)}g` },
    { label: 'Saturated Fat', value: `${Math.round(calories * 0.015)}g`, indent: true },
    { label: 'Trans Fat', value: '0.5g', indent: true },
    { label: 'Cholesterol', value: `${Math.round(calories * 0.28)}mg` },
    { label: 'Sodium', value: `${Math.round(calories * 1.2)}mg` },
    { label: 'Potassium', value: '6% DV' },
    { label: 'Carbohydrates', value: `${Math.round(calories * 0.12)}g` },
    { label: 'Fiber', value: '4g', indent: true },
    { label: 'Sugar', value: `${Math.round(calories * 0.05)}g`, indent: true },
    { label: 'Protein', value: `${Math.round(calories * 0.035)}g` },
    { label: 'Calcium', value: '8% DV' },
    { label: 'Iron', value: '25% DV' },
  ];
}

export function SingleProductScreen() {
  const navigate = useNavigate();
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const {
    getProductById,
    getProductImagePath,
    getIngredientsForProduct,
    hasEditForProduct,
    getAddOnGroupsForProduct,
    categories,
  } = useMenuData();

  const product = getProductById(productId || '');
  const ingredients = product ? getIngredientsForProduct(product.id) : [];
  const addOnGroups = product ? getAddOnGroupsForProduct(product.id) : [];
  const addOnGroup = addOnGroups.length > 0 ? addOnGroups[0] : null;

  // Determine product capabilities from category slug and product name
  const productName = product?.name || '';
  const isFrosty = isFrostyProduct(slug || '');
  const hasFriesSize = friesSizeProducts.has(productName);
  const showSizeSelector = (sizableCategories.has(slug || '') && !noSizeProducts.has(productName))
    || isFrosty || hasFriesSize;
  const showFlavorSelector = product ? isFreestyle(productName) : false;
  const nonComboCategories = new Set(['beverages', 'coffee', 'frosty', 'fries-sides', 'bakery', 'give-something-back', 'sides-and-sweets', 'breakfast-biggie-deals', 'breakfast-meal-deals', 'everyday-value', 'biggie-deals']);
  const showMakeItCombo = !product?.isCombo && product?.productType === 'single' && !nonComboCategories.has(slug || '');
  const coldBrewIngs = coldBrewIngredients[productName] || null;
  const frostyIngs = frostyIngredients[productName] || null;
  const frostyExtras = frostyAddExtras[productName] || null;
  const sizeOptions = isFrosty || hasFriesSize ? frostySizes : standardSizes;
  const accompaniment = saladDressings[productName]
    || (nuggetTenderNames.has(productName) ? nuggetSauceAccompaniment : null);
  const saladIngs = saladIngredients[productName] || null;
  const fsIngs = friesSidesIngredients[productName] || null;
  const fsExtras = friesSidesAddExtras[productName] || null;

  // Local state
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedSize, setSelectedSize] = useState('small');
  const [selectedFlavor, setSelectedFlavor] = useState('none');
  const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [addOnChips, setAddOnChips] = useState<Record<string, string>>({});
  const [addOnCounters, setAddOnCounters] = useState<Record<string, number>>({});
  const [showMediumBar, setShowMediumBar] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [nutritionTab, setNutritionTab] = useState('nutrition');
  const [showAllAddOns, setShowAllAddOns] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const nutritionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll handler for medium top bar
  const handleScroll = useCallback(() => {
    if (headerRef.current && scrollRef.current) {
      const headerBottom = headerRef.current.getBoundingClientRect().bottom;
      const scrollTop = scrollRef.current.getBoundingClientRect().top;
      setShowMediumBar(headerBottom < scrollTop + 54);
    }
  }, []);

  if (!product) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%', padding: 32 }}>
        <span className="font-body text-[16px]" style={{ color: 'var(--color-text-secondary-default)' }}>
          Product not found
        </span>
      </div>
    );
  }

  const priceDisplay = product.isCombo && product.comboPrice
    ? formatPrice(product.comboPrice)
    : formatPrice(product.price);
  const caloriesDisplay = formatCalories(product.calories);
  const subtitleDisplay = `${priceDisplay} | ${caloriesDisplay}`;

  const handleIngredientToggle = (ingredientId: string) => {
    setRemovedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(ingredientId)) next.delete(ingredientId);
      else next.add(ingredientId);
      return next;
    });
  };

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev);
      if (next.has(addOnId)) next.delete(addOnId);
      else next.add(addOnId);
      return next;
    });
  };

  const handleAddToBag = () => {
    // TODO: dispatch to BagContext
    navigate(-1);
  };

  const scrollToNutrition = () => {
    nutritionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Build "Your Changes" list from removed ingredients + selected add-ons
  const changes: { id: string; label: string; type: 'removal' | 'addition' }[] = [];
  // Removals — look up ingredient names from all available ingredient sources
  removedIngredients.forEach(ingId => {
    const ing = ingredients.find(i => i.id === ingId);
    const name = ing?.name
      || saladIngs?.find(i => i.name === ingId)?.name
      || coldBrewIngs?.find(i => i.name === ingId)?.name
      || frostyIngs?.find(i => i.name === ingId)?.name
      || fsIngs?.find(i => i.name === ingId)?.name
      || ingId;
    changes.push({ id: `rem_${ingId}`, label: `No ${name}`, type: 'removal' });
  });
  // Additions
  selectedAddOns.forEach(addonId => {
    const addon = addOns.find(a => a.id === addonId);
    const fExtra = frostyExtras?.find(a => a.id === addonId);
    const fsExtra = fsExtras?.find(a => a.id === addonId);
    const name = addon?.name || fExtra?.name || fsExtra?.name || addonId;
    changes.push({ id: `add_${addonId}`, label: name, type: 'addition' });
  });
  const hasChanges = changes.length > 0;

  const handleResetAll = () => {
    setRemovedIngredients(new Set());
    setSelectedAddOns(new Set());
    setAddOnChips({});
    setAddOnCounters({});
  };

  const handleDismissChange = (changeId: string) => {
    if (changeId.startsWith('rem_')) {
      const ingId = changeId.slice(4);
      setRemovedIngredients(prev => {
        const next = new Set(prev);
        next.delete(ingId);
        return next;
      });
    } else if (changeId.startsWith('add_')) {
      const addonId = changeId.slice(4);
      setSelectedAddOns(prev => {
        const next = new Set(prev);
        next.delete(addonId);
        return next;
      });
      setAddOnChips(prev => {
        const next = { ...prev };
        delete next[addonId];
        return next;
      });
      setAddOnCounters(prev => {
        const next = { ...prev };
        delete next[addonId];
        return next;
      });
    }
  };

  // Visible add-ons (collapsed vs expanded)
  const addOns = addOnGroup?.addOns || [];
  const visibleAddOns = showAllAddOns ? addOns : addOns.slice(0, 5);
  const hasMoreAddOns = addOns.length > 5;

  return (
    <div className="relative h-full" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
      {/* Medium top bar — absolutely positioned overlay, slides in on scroll */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          transform: showMediumBar ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
          pointerEvents: showMediumBar ? 'auto' : 'none',
        }}
      >
        <MediumTopAppBar
          title={product.name}
          subtitle={subtitleDisplay}
          isFavorited={isFavorited}
          onFavoriteToggle={setIsFavorited}
          leadingIcon={product.isCombo ? 'close' : 'back'}
          onBack={() => {
            if (product.isCombo) {
              setShowLeaveDialog(true);
            } else {
              navigate(-1);
            }
          }}
          visible={true}
        />
      </div>

      <div
        ref={scrollRef}
        className="h-full overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Transparent top bar — X for combos, back arrow for singles */}
        {/* Hidden when MediumTopAppBar is visible to prevent overlap */}
        {!showMediumBar && (
          <TransparentTopBar
            leadingIcon={product.isCombo ? 'close' : 'back'}
            onBack={() => {
              if (product.isCombo) {
                setShowLeaveDialog(true);
              } else {
                navigate(-1);
              }
            }}
          />
        )}

      {/* Module 1: Hero Image */}
      <HeroImage
        imageSrc={getProductImagePath(product.image)}
        alt={product.name}
        extraPadding
      />

      {/* Module 2+3+4: Product Header */}
      <div ref={headerRef}>
        <ProductHeader
          title={product.name}
          price={product.isCombo ? 'Price in Bag' : priceDisplay}
          calories={caloriesDisplay}
          isFavorited={isFavorited}
          onFavoriteToggle={setIsFavorited}
          onNutritionPress={scrollToNutrition}
        />
      </div>

      {/* ── COMBO LAYOUT: Component Cards ── */}
      {product.isCombo && (product as any).defaultComponents && (
        <>
          {/* Combo size selector */}
          {(product as any).sizeSelectorEnabled && (
            <div className="flex items-center gap-wds-8 px-wds-16 pb-wds-8">
              <button
                className="flex items-center gap-wds-4 border-none"
                style={{
                  padding: '8px 16px',
                  borderRadius: 9999,
                  border: '1.5px solid var(--color-border-brand-secondary-default)',
                  backgroundColor: 'var(--color-bg-primary-default)',
                  color: 'var(--color-text-brand-secondary-default)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                Med
                <span
                  className="inline-block"
                  style={{
                    width: 12, height: 12,
                    backgroundColor: 'var(--color-icon-brand-secondary-default)',
                    maskImage: 'url(/icons/caret-down.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                    WebkitMaskImage: 'url(/icons/caret-down.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                  }}
                />
              </button>
            </div>
          )}

          {/* Component cards */}
          <div className="px-wds-16 pb-wds-16" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {((product as any).defaultComponents as Array<{ role: string; productRef: string | null; label: string; sizePrefix: string | null; subtitle: string | null }>).map((comp, i) => {
              const displayName = comp.sizePrefix ? `${comp.sizePrefix} ${comp.label}` : comp.label;
              const compImage = comp.productRef
                ? getProductImagePath(categories.flatMap(c => c.items).find(p => p.id === comp.productRef)?.image || '')
                : '/images/fallback.png';
              return (
                <div
                  key={`${comp.role}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border-secondary-default)',
                    backgroundColor: 'var(--color-bg-primary-default)',
                  }}
                >
                  <img
                    src={compImage}
                    alt=""
                    style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      className="font-display text-[16px] leading-[20px] font-semibold"
                      style={{ color: 'var(--color-text-primary-default)', display: 'block' }}
                    >
                      {displayName}
                    </span>
                    {comp.subtitle && (
                      <span
                        className="font-body text-[14px] leading-[20px]"
                        style={{ color: 'var(--color-text-secondary-default)', display: 'block' }}
                      >
                        {comp.subtitle}
                      </span>
                    )}
                  </div>
                  <button
                    className="font-display text-[14px] border-none bg-transparent p-0"
                    style={{ fontWeight: 700, color: 'var(--color-text-brand-secondary-default)', flexShrink: 0 }}
                    onClick={() => {
                      if (comp.productRef) navigate(`/order/menu/${slug}/${comp.productRef}`);
                    }}
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── SINGLE ITEM LAYOUT: Standard modules ── */}
      {/* Module 5: Size Selector (conditional — beverages, coffee, frosty, fries) */}
      {showSizeSelector && (
        <div className="flex gap-wds-8 px-wds-16 pb-wds-16">
          {sizeOptions.map((size) => (
            <Chip
              key={size.id}
              type="select"
              label={size.label}
              selected={selectedSize === size.id}
              onPress={() => setSelectedSize(size.id)}
            />
          ))}
        </div>
      )}

      {/* Module 7: Flavor Card (conditional — Freestyle only, shows selected flavor) */}
      {showFlavorSelector && (
        <div className="pb-wds-8">
          <ListRow
            style="rounded"
            headline={selectedFlavor === 'none' ? 'No Flavor' : (freestyleFlavors.find(f => f.id === selectedFlavor)?.label || 'No Flavor')}
            leading="image"
            leadingImage={freestyleFlavors.find(f => f.id === selectedFlavor)?.image}
            trailing="none"
            showDivider={false}
          />
        </div>
      )}

      {/* Module 6: Make it a Combo (conditional — not shown on sizable items like drinks/fries) */}
      {showMakeItCombo && (
        <div className="pb-wds-8">
          <ListRow
            style="rounded"
            headline="Make it a Combo"
            supportText="$8.99"
            leading="image"
            leadingImage={getProductImagePath(product.image)}
            trailing="icon"
            onPress={() => {/* TODO: combo wizard */}}
          />
        </div>
      )}

      {/* Module 7: Included Accompaniment Card (conditional — salad dressings, nugget sauces) */}
      {accompaniment && (
        <div className="pb-wds-8">
          <ListRow
            style="rounded"
            headline={accompaniment.name}
            supportText={accompaniment.calories}
            leading="image"
            leadingImage={accompaniment.image}
            trailing="none"
            metadata="Edit"
            metadataColor="var(--color-text-brand-secondary-default)"
            metadataWeight={700}
            showDivider={false}
          />
        </div>
      )}

      {/* Module 11: Flavor Selector (conditional — Freestyle only) */}
      {showFlavorSelector && (
        <>
          <SectionHeader title="Choose a Flavor" subtitle="Choose one" size="small" />
          <div className="px-wds-16 pb-wds-16">
            {freestyleFlavors.map((flavor) => (
              <button
                key={flavor.id}
                className="flex items-center w-full border-none bg-transparent"
                style={{
                  padding: '12px 0',
                  gap: 16,
                  borderBottom: '1px solid var(--color-border-tertiary-default)',
                  textAlign: 'left',
                }}
                onClick={() => setSelectedFlavor(flavor.id)}
              >
                {/* Flavor logo image */}
                <img
                  src={flavor.image}
                  alt=""
                  aria-hidden="true"
                  style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, objectFit: 'cover' }}
                />

                {/* Flavor name */}
                <span
                  className="font-body text-[16px] leading-[24px]"
                  style={{ flex: 1, color: 'var(--color-text-primary-default)' }}
                >
                  {flavor.label}
                </span>

                {/* Radio indicator */}
                <RadioButton
                  selected={selectedFlavor === flavor.id}
                  onChange={() => setSelectedFlavor(flavor.id)}
                />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Module 10a: What's On It — cold brew inline ingredients (conditional) */}
      {coldBrewIngs && (
        <>
          <SectionHeader title="What's On It" subtitle="Tap tile to edit, tap the check to remove" size="small" />
          <div
            className="px-wds-16 pb-wds-16"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
          >
            {coldBrewIngs.map((ing) => (
              <IngredientCard
                key={ing.name}
                name={ing.name}
                imageSrc={ing.image}
                state="selected"
                editable
                onToggle={() => {}}
                onEdit={() => {}}
              />
            ))}
          </div>
        </>
      )}

      {/* Module 10d: What's On It — Fries & Sides per-product ingredients (conditional) */}
      {fsIngs && fsIngs.length > 0 && (
        <>
          <SectionHeader title="What's On It" subtitle="Tap tile to edit, tap the check to remove" size="small" />
          <div
            className="px-wds-16 pb-wds-16"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
          >
            {fsIngs.map((ing) => (
              <IngredientCard
                key={ing.name}
                name={ing.name}
                imageSrc={ing.image}
                state="selected"
                editable
                onToggle={() => {}}
                onEdit={() => {}}
              />
            ))}
          </div>
        </>
      )}

      {/* Module 12c: Add Extras — Fries & Sides per-product (conditional) */}
      {fsExtras && !addOnGroup && (
        <>
          <SectionHeader title="Add Extras" size="small" />
          <div>
            {fsExtras.map((extra) => (
              <IngredientCollapse
                key={extra.id}
                headline={extra.name}
                trailing={extra.price > 0 ? `+${formatPrice(extra.price)}` : undefined}
                leading="image"
                imageSrc={extra.image}
                checked={selectedAddOns.has(extra.id)}
                onCheckedChange={() => handleAddOnToggle(extra.id)}
                modifierType="counter"
                counterValue={addOnCounters[extra.id] || 1}
                counterMin={1}
                counterMax={3}
                onCounterChange={(val) => setAddOnCounters(prev => ({ ...prev, [extra.id]: val }))}
              />
            ))}
          </div>
        </>
      )}

      {/* Module 10c: What's On It — Salad per-product ingredients (conditional) */}
      {saladIngs && (
        <>
          <SectionHeader title="What's On It" subtitle="Tap tile to edit, tap the check to remove" size="small" />
          <div
            className="px-wds-16 pb-wds-16"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
          >
            {saladIngs.map((ing) => (
              <IngredientCard
                key={ing.name}
                name={ing.name}
                imageSrc={ing.image}
                state="selected"
                editable={false}
                onToggle={() => {}}
              />
            ))}
          </div>
        </>
      )}

      {/* Module 10b: What's On It — Frosty per-product ingredients (conditional) */}
      {frostyIngs && (
        <>
          <SectionHeader title="What's On It" subtitle="Tap tile to edit, tap the check to remove" size="small" />
          <div
            className="px-wds-16 pb-wds-16"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
          >
            {frostyIngs.map((ing) => (
              <IngredientCard
                key={ing.name}
                name={ing.name}
                imageSrc={ing.image}
                state="selected"
                editable
                onToggle={() => {}}
                onEdit={() => {}}
              />
            ))}
          </div>
        </>
      )}

      {/* Module 12b: Add Extras — Frosty per-product (conditional) */}
      {frostyExtras && !addOnGroup && (
        <>
          <SectionHeader title="Add Extras" size="small" />
          <div>
            {frostyExtras.map((extra) => (
              <IngredientCollapse
                key={extra.id}
                headline={extra.name}
                trailing={`+${formatPrice(extra.price)}`}
                leading="image"
                imageSrc={extra.image}
                checked={selectedAddOns.has(extra.id)}
                onCheckedChange={() => handleAddOnToggle(extra.id)}
                modifierType="counter"
                counterValue={addOnCounters[extra.id] || 1}
                counterMin={1}
                counterMax={3}
                onCounterChange={(val) => setAddOnCounters(prev => ({ ...prev, [extra.id]: val }))}
              />
            ))}
          </div>
        </>
      )}

      {/* Module 9: "Your Changes" Summary (conditional — appears when modifications exist) */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header: "Your Changes" + "Reset" */}
            <div className="flex items-center justify-between px-wds-16" style={{ paddingTop: 16, paddingBottom: 8 }}>
              <span
                className="font-display text-[18px] leading-[24px]"
                style={{ fontWeight: 800, color: 'var(--color-text-primary-default)' }}
              >
                Your Changes
              </span>
              <button
                className="font-display text-[16px] leading-[20px] border-none bg-transparent p-0"
                style={{ fontWeight: 700, color: 'var(--color-text-brand-secondary-default)' }}
                onClick={handleResetAll}
              >
                Reset
              </button>
            </div>
            {/* Change pills */}
            <div className="flex flex-wrap gap-wds-8 px-wds-16 pb-wds-16">
              <AnimatePresence>
                {changes.map((change) => (
                  <motion.button
                    key={change.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-wds-4 border-none"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 9999,
                      backgroundColor: change.type === 'removal'
                        ? 'var(--color-bg-validation-critical)'
                        : 'var(--color-bg-brand-secondary-default)',
                      color: 'var(--color-text-onbrand-default)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: '16px',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => handleDismissChange(change.id)}
                  >
                    {change.label}
                    <span style={{ marginLeft: 2, fontSize: 14 }}>×</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module 10: What's On It (conditional — from ingredient data) */}
      {ingredients.length > 0 && (
        <>
          <SectionHeader title="What's On It" subtitle="Tap tile to edit, tap the check to remove" size="small" />
          <div
            className="px-wds-16 pb-wds-16"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
          >
            {ingredients.map((ing) => {
              const isRemoved = removedIngredients.has(ing.id);
              const hasEdit = product ? hasEditForProduct(ing.id, product.id) : ing.hasEdit;
              return (
                <IngredientCard
                  key={ing.id}
                  name={ing.name}
                  imageSrc={getIngredientImage(ing.name)}
                  state={isRemoved ? 'unselected' : 'selected'}
                  editable={hasEdit}
                  onToggle={() => handleIngredientToggle(ing.id)}
                  onEdit={hasEdit ? () => {/* TODO: quantity bottom sheet */} : undefined}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Module 12: Add Extras (conditional) */}
      {addOns.length > 0 && (
        <>
          <SectionHeader title="Add Extras" size="small" />
          <div>
            {visibleAddOns.map((addon) => {
              const modType = getAddOnModifierType(addon.name);
              return (
                <IngredientCollapse
                  key={addon.id}
                  headline={addon.name}
                  trailing={addon.price > 0 ? `+${formatPrice(addon.price)}` : undefined}
                  leading="image"
                  imageSrc={getAddOnImage(addon.name)}
                  checked={selectedAddOns.has(addon.id)}
                  onCheckedChange={() => handleAddOnToggle(addon.id)}
                  modifierType={modType}
                  chipOptions={modType === 'chips' ? amountChipOptions : undefined}
                  selectedChip={addOnChips[addon.id] || 'reg'}
                  onChipSelect={(chipId) => setAddOnChips(prev => ({ ...prev, [addon.id]: chipId }))}
                  counterValue={addOnCounters[addon.id] || 1}
                  counterMin={1}
                  counterMax={addon.category === 'sauce' || addon.name.includes('Sauce') || addon.name.includes('BBQ') ? 2 : (addon.maxQuantity || 5)}
                  onCounterChange={(val) => setAddOnCounters(prev => ({ ...prev, [addon.id]: val }))}
                />
              );
            })}
            {hasMoreAddOns && (
              <button
                className="flex items-center justify-center w-full border-none bg-transparent"
                style={{
                  padding: '12px 0',
                  gap: 4,
                  color: 'var(--color-text-brand-secondary-default)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  fontWeight: 700,
                }}
                onClick={() => setShowAllAddOns(!showAllAddOns)}
              >
                {showAllAddOns ? 'View Less' : 'View More'}
                <span
                  aria-hidden="true"
                  className="inline-block"
                  style={{
                    width: 16, height: 16,
                    backgroundColor: 'var(--color-icon-brand-secondary-default)',
                    maskImage: `url(/icons/caret-${showAllAddOns ? 'up' : 'down'}.svg)`,
                    maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                    WebkitMaskImage: `url(/icons/caret-${showAllAddOns ? 'up' : 'down'}.svg)`,
                    WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                  }}
                />
              </button>
            )}
          </div>
        </>
      )}

      {/* Module 13: Nutrition / Ingredients tabs */}
      <div ref={nutritionRef}>
        <Tabs
          type="fixed"
          tabs={[
            { id: 'nutrition', label: 'Nutrition' },
            { id: 'ingredients', label: 'Ingredients' },
          ]}
          activeTab={nutritionTab}
          onTabChange={setNutritionTab}
        />
        <div className="px-wds-16 py-wds-16">
          {nutritionTab === 'nutrition' ? (
            <>
              {/* Allergens */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  backgroundColor: 'var(--color-bg-secondary-default)',
                  marginBottom: 16,
                }}
              >
                <span
                  className="font-display text-[18px] leading-[24px]"
                  style={{ fontWeight: 800, color: 'var(--color-text-primary-default)', display: 'block', marginBottom: 8 }}
                >
                  Allergens:
                </span>
                <div className="flex flex-wrap gap-wds-12">
                  {[
                    { name: 'Wheat', icon: 'wheat' },
                    { name: 'Soy', icon: 'soy' },
                    { name: 'Milk', icon: 'dairy' },
                    { name: 'Egg', icon: 'egg' },
                    { name: 'Sesame', icon: 'sesame' },
                  ].map(a => (
                    <div key={a.name} className="flex items-center gap-wds-4">
                      <img
                        src={`/icons/allergens/${a.icon}.svg`}
                        alt=""
                        aria-hidden="true"
                        style={{ width: 16, height: 16 }}
                      />
                      <span className="font-body text-[14px]" style={{ color: 'var(--color-text-secondary-default)' }}>
                        {a.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <IngredientTable rows={getMockNutrition(product.calories.max || product.calories.min)} />
            </>
          ) : (
            <p
              className="font-body text-[14px] leading-[20px]"
              style={{ color: 'var(--color-text-secondary-default)', margin: 0 }}
            >
              {product.name} ingredients: enriched flour (wheat flour, niacin, reduced iron, thiamine mononitrate, riboflavin, folic acid), water, sugar, soybean oil, yeast, contains 2% or less of: salt, dough conditioners (sodium stearoyl lactylate, calcium peroxide), wheat gluten, enzymes, calcium sulfate, monocalcium phosphate, ammonium sulfate, calcium propionate. Fresh beef, American cheese (milk, cheese culture, salt, enzymes), ketchup, mayonnaise, pickles, onion.
            </p>
          )}
        </div>
      </div>

      {/* Bottom spacer for OrderBar */}
      <div style={{ height: 100 }} />
      </div>{/* end scroll container */}

      {/* Module 14: OrderBar — absolutely positioned at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 }}>
        <OrderBar
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToBag={handleAddToBag}
        />
      </div>

      {/* Combo leave confirmation dialog */}
      <Dialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        variant="standard"
        showClose={false}
        headline="Don't lose those tasty changes!"
        supportText="Changes will be lost if you leave before adding to the bag."
        primaryAction={{
          label: 'Stay',
          onClick: () => setShowLeaveDialog(false),
        }}
        secondaryAction={{
          label: 'Leave',
          onClick: () => navigate(`/order/menu/${slug || 'hamburgers'}`),
        }}
      />
    </div>
  );
}
