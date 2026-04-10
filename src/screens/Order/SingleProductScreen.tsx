import { useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { OrderBar } from '../../components/OrderBar/OrderBar';
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
};

function getIngredientImage(name: string): string {
  return ingredientImageMap[name] || '/images/wendys-wave-red.svg';
}

function getAddOnImage(name: string): string {
  return addOnImageMap[name] || '/images/wendys-wave-red.svg';
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
  } = useMenuData();

  const product = getProductById(productId || '');
  const ingredients = product ? getIngredientsForProduct(product.id) : [];
  const addOnGroups = product ? getAddOnGroupsForProduct(product.id) : [];
  const addOnGroup = addOnGroups.length > 0 ? addOnGroups[0] : null;

  // Local state
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [addOnChips, setAddOnChips] = useState<Record<string, string>>({});
  const [addOnCounters, setAddOnCounters] = useState<Record<string, number>>({});
  const [showMediumBar, setShowMediumBar] = useState(false);
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
          onBack={() => navigate(`/order/menu/${slug || 'hamburgers'}`)}
          visible={true}
        />
      </div>

      <div
        ref={scrollRef}
        className="h-full overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Transparent top bar — visible initially */}
        <TransparentTopBar
          leadingIcon="back"
          onBack={() => navigate(`/order/menu/${slug || 'hamburgers'}`)}
        />

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
          price={priceDisplay}
          calories={caloriesDisplay}
          isFavorited={isFavorited}
          onFavoriteToggle={setIsFavorited}
          onNutritionPress={scrollToNutrition}
        />
      </div>

      {/* Module 6: Make it a Combo (conditional — shown on single items that can be combo'd) */}
      {!product.isCombo && product.productType === 'single' && (
        <div className="pb-wds-8">
          <ListRow
            style="rounded"
            headline="Make it a Combo"
            leading="image"
            leadingImage={getProductImagePath(product.image)}
            trailing="icon"
            onPress={() => {/* TODO: combo wizard */}}
          />
        </div>
      )}

      {/* Module 10: What's On It (conditional) */}
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
                  {['Wheat', 'Soy', 'Milk', 'Egg', 'Sesame'].map(a => (
                    <span key={a} className="font-body text-[14px]" style={{ color: 'var(--color-text-secondary-default)' }}>
                      {a}
                    </span>
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
    </div>
  );
}
