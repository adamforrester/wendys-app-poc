import { motion } from 'framer-motion';
import { useMenuData } from '../../hooks/useMenuData';
import type { BagItem } from '../../context/BagContext';

/**
 * Drive-thru-style bag tile shown on the voice ordering screen as items
 * are added to the bag. Small product image on the left, name + price on
 * the right. Animates in via the parent's `<AnimatePresence>` — keep this
 * component a `motion.div` so its exit animation can play if we ever
 * support voice removal.
 */
export interface VoiceBagItemTileProps {
  item: BagItem;
}

export function VoiceBagItemTile({ item }: VoiceBagItemTileProps) {
  const menu = useMenuData();
  const product = menu.getProductById(item.menuItemId);
  const imageSrc = product?.image
    ? menu.getProductImagePath(product.image)
    : '/images/wendys-wave.png';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px 8px 8px',
        borderRadius: 9999,
        backgroundColor: 'var(--color-bg-primary-default)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        border: '1px solid var(--color-border-tertiary-default)',
      }}
    >
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        style={{
          width: 44,
          height: 44,
          borderRadius: 9999,
          objectFit: 'cover',
          backgroundColor: 'var(--color-bg-secondary-default)',
          flexShrink: 0,
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/images/wendys-wave.png';
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="font-display"
          style={{
            color: 'var(--color-text-primary-default)',
            fontWeight: 800,
            fontSize: 14,
            lineHeight: '18px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.name}
          {item.quantity > 1 && (
            <span style={{ opacity: 0.6, fontWeight: 600 }}> × {item.quantity}</span>
          )}
        </div>
        {item.price > 0 && (
          <div
            className="font-body"
            style={{
              color: 'var(--color-text-secondary-default)',
              fontSize: 12,
              lineHeight: '16px',
            }}
          >
            ${item.price.toFixed(2)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
