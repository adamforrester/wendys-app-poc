import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { motion, useAnimation, useDragControls, type PanInfo } from 'framer-motion';
import { springSheet } from '../../animations/presets';

export interface BottomSheetProps {
  /** Whether the bottom sheet is open */
  isOpen: boolean;
  /** Called when the user dismisses the sheet (drag down or scrim tap) */
  onClose: () => void;
  /** Height as a percentage of the device screen (0-100), or a fixed pixel value */
  height?: number | `${number}%`;
  /** Maximum height the sheet can be dragged to (percentage of screen). Default: 92 */
  maxHeight?: number;
  /** Show the drag handle indicator */
  showHandle?: boolean;
  /** Allow scrolling within the sheet content */
  scrollable?: boolean;
  /** Show scrim (dark overlay) behind the sheet */
  showScrim?: boolean;
  /** Sheet content */
  children: ReactNode;
}

const DEVICE_HEIGHT = 844;

function resolveHeight(height: number | `${number}%`): number {
  if (typeof height === 'string' && height.endsWith('%')) {
    const pct = parseFloat(height) / 100;
    return Math.round(DEVICE_HEIGHT * pct);
  }
  return height as number;
}

export function BottomSheet({
  isOpen,
  onClose,
  height = '50%',
  maxHeight = 92,
  showHandle = true,
  scrollable = false,
  showScrim = true,
  children,
}: BottomSheetProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const resolvedHeight = resolveHeight(height);
  const maxHeightPx = Math.round(DEVICE_HEIGHT * (maxHeight / 100));
  const minY = DEVICE_HEIGHT - maxHeightPx; // top limit (can't drag higher than this)

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      // If dragged down more than 100px or flicked down fast, dismiss
      if (offset > 100 || velocity > 500) {
        onClose();
      } else {
        // Snap back to open position
        controls.start({
          y: DEVICE_HEIGHT - resolvedHeight,
          transition: springSheet,
        });
      }
    },
    [controls, onClose, resolvedHeight]
  );

  return (
    <>
      {/* Scrim overlay */}
      {showScrim && (
        <motion.div
          className="absolute inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        className="absolute left-0 right-0 z-50 flex flex-col bg-[var(--color-bg-primary-default)]"
        style={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          boxShadow: '0 -4px 8px rgba(0,0,0,0.2)',
          bottom: 0,
          top: 'auto',
          height: maxHeightPx,
        }}
        initial={{ y: DEVICE_HEIGHT }}
        animate={{ y: isOpen ? DEVICE_HEIGHT - resolvedHeight : DEVICE_HEIGHT }}
        exit={{ y: DEVICE_HEIGHT }}
        transition={springSheet}
        drag="y"
        dragControls={dragControls}
        dragConstraints={{ top: minY, bottom: DEVICE_HEIGHT }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {/* Handle area — always the drag target */}
        {showHandle && (
          <div
            className="flex justify-center items-center pt-wds-16 pb-wds-16 px-wds-16 cursor-grab active:cursor-grabbing flex-shrink-0"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div
              className="bg-[var(--color-bg-primary-inverse-default)]"
              style={{ width: 40, height: 4, borderRadius: 100 }}
            />
          </div>
        )}

        {/* Content */}
        <div
          className={`flex-1 min-h-0 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}
          style={{ paddingBottom: 24 }}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}
