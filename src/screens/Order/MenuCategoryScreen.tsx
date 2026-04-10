import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { ListRow } from '../../components/ListRow/ListRow';
import { SectionHeader } from '../../components/SectionHeader/SectionHeader';
import { IconButton } from '../../components/IconButton/IconButton';
import { CategoryCard } from '../../components/CategoryCard/CategoryCard';
import { useLocationData } from '../../hooks/useLocationData';
import { useUserData } from '../../hooks/useUserData';
import { useDaypart } from '../../context/DaypartContext';

interface CategoryDef {
  name: string;
  slug: string;
  image: string;
}

/** Lunch/Dinner/Late Night categories (production app order) */
const allDayCategories: CategoryDef[] = [
  { name: 'Combos', slug: 'combos', image: 'category_combos_2492.png' },
  { name: 'Hamburgers', slug: 'hamburgers', image: 'category_hamburgers_2493.png' },
  { name: 'Chicken, Nuggets & More', slug: 'chicken-nuggets-more', image: 'category_chicken-nuggets-more_2494.png' },
  { name: 'Tenders', slug: 'tenders', image: 'category_tenders_2243.png' },
  { name: 'Fresh-Made Salads', slug: 'fresh-made-salads', image: 'category_fresh-made-salads_2495.png' },
  { name: 'Fries & Sides', slug: 'fries-sides', image: 'category_fries-sides_125.png' },
  { name: 'Coffee', slug: 'coffee', image: 'category_coffee_895.png' },
  { name: 'Beverages', slug: 'beverages', image: 'category_beverages_127.png' },
  { name: 'Frosty\u00AE', slug: 'frosty', image: 'category_frosty_126.png' },
  { name: 'Bakery', slug: 'bakery', image: 'category_bakery_131.png' },
  { name: "Wendy's Kids' Meal\u00AE", slug: 'wendy-s-kids-meal', image: 'category_kids-meal_129.png' },
  { name: 'Everyday Value', slug: 'everyday-value', image: 'category_everyday-value_2496.png' },
  { name: 'Biggie Deals\u00AE', slug: 'biggie-deals', image: 'category_biggie-deals_130.png' },
];

/** Breakfast categories */
const breakfastCategories: CategoryDef[] = [
  { name: 'Breakfast Combos', slug: 'breakfast-combos', image: 'category_breakfast-combos.png' },
  { name: 'Croissants', slug: 'croissants', image: 'category_croissants.png' },
  { name: 'Biscuits', slug: 'biscuits', image: 'category_biscuits.png' },
  { name: 'Classics', slug: 'classics', image: 'category_classics.png' },
  { name: 'Breakfast Burrito', slug: 'breakfast-burrito', image: 'category_breakfast-combos.png' },
  { name: 'Sides and Sweets', slug: 'sides-and-sweets', image: 'category_sides-and-sweets.png' },
  { name: 'Breakfast Meal Deals', slug: 'breakfast-meal-deals', image: 'category_breakfast-meal-deals.png' },
  { name: 'Breakfast Biggie Deals', slug: 'breakfast-biggie-deals', image: 'category_breakfast-biggie-deals.png' },
  { name: 'Coffee', slug: 'coffee', image: 'category_coffee_895.png' },
  { name: 'Beverages', slug: 'beverages', image: 'category_beverages_127.png' },
  { name: 'Bakery', slug: 'bakery', image: 'category_bakery_131.png' },
];

export function MenuCategoryScreen() {
  const navigate = useNavigate();
  const { getLocationById, getFormattedAddress } = useLocationData();
  const { getFavoriteLocationId } = useUserData();
  const { state: daypartState } = useDaypart();

  const isBreakfast = daypartState.daypart === 'breakfast';
  const categories = isBreakfast ? breakfastCategories : allDayCategories;

  const favoriteId = getFavoriteLocationId();
  const selectedLocation = getLocationById(favoriteId);
  const locationAddress = selectedLocation ? getFormattedAddress(selectedLocation) : '1234 Liberty Way';

  return (
    <>
      <TopAppBar
        titleMode="title"
        title="Menu"
        titlePlacement="center"
        titleWeight="semibold"
        showBackButton
        onBack={() => navigate('/order')}
        showBag
      />

      {/* Pickup Location card */}
      <div className="pt-wds-8">
        <ListRow
          style="rounded"
          overline="Pickup Location"
          headline={locationAddress}
          leading="icon"
          leadingIcon="wendys-location-3-filled"
          leadingIconColor="var(--color-icon-brand-primary-default)"
          trailing="none"
          metadata="Edit"
          metadataColor="var(--color-text-brand-secondary-default)"
          metadataWeight={700}
          showDivider={false}
          onPress={() => navigate('/order')}
        />
      </div>

      {/* Offer Applied card (mock) */}
      <div>
        <ListRow
          style="rounded"
          overline="Offer Applied"
          headline="Free Any Size Fry w/ $5 Purchase"
          leading="icon"
          leadingIcon="tag-filled"
          leadingIconColor="var(--color-icon-brand-secondary-default)"
          trailing="icon"
          trailingIcon="close"
          showDivider={false}
        />
      </div>

      {/* Categories section */}
      <SectionHeader title="Categories" size="large" />

      {/* Quick action icon buttons */}
      <div className="flex justify-center gap-wds-24 px-wds-16 pb-wds-16">
        <IconButton
          icon="clock"
          iconColor="var(--color-icon-brand-primary-default)"
          headline="Recents"
          size="large"
          buttonStyle="rounded"
          onPress={() => {}}
        />
        <IconButton
          icon="favorite-filled"
          iconColor="var(--color-icon-brand-primary-default)"
          headline="Favorites"
          size="large"
          buttonStyle="rounded"
          onPress={() => {}}
        />
        <IconButton
          icon="rewards-simple"
          multiColor
          headline="Rewards"
          size="large"
          buttonStyle="rounded"
          onPress={() => navigate('/offers')}
        />
      </div>

      {/* Category cards grid */}
      <div
        className="px-wds-16 pb-wds-16"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}
      >
        {categories.map((cat) => (
          <CategoryCard
            key={cat.slug}
            title={cat.name}
            imageSrc={`/images/category-images/${cat.image}`}
            onPress={() => navigate(`/order/menu/${cat.slug}`)}
          />
        ))}
      </div>
    </>
  );
}
