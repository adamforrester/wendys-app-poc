import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import { TextField } from '../../components/TextField/TextField';
import { OrderLocationCard } from '../../components/OrderLocationCard/OrderLocationCard';
import { useLocationData } from '../../hooks/useLocationData';
import { useUserData } from '../../hooks/useUserData';
import type { PickupMethod } from '../../components/OrderLocationCard/OrderLocationCard';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function getPickupMethods(fulfillmentMethods: string[], isOpen: boolean): PickupMethod[] {
  const allMethods: { id: string; name: string; imageSrc: string }[] = [
    { id: 'drive-thru', name: 'Drive Thru', imageSrc: '/images/nurdles/Drive Thru.svg' },
    { id: 'carry-out', name: 'Carryout', imageSrc: '/images/nurdles/Carryout-right.svg' },
    { id: 'curbside', name: 'Curbside', imageSrc: '/images/nurdles/Curbside.svg' },
    { id: 'dine-in', name: 'Dine In', imageSrc: '/images/nurdles/Dine In.svg' },
  ];

  return allMethods
    .filter(m => fulfillmentMethods.includes(m.id))
    .map(m => ({
      ...m,
      status: isOpen ? 'Open' as const : 'Closed' as const,
      disabled: !isOpen,
    }));
}

function LocationPin({ number, isSelected, isOpen }: { number: number; isSelected: boolean; isOpen: boolean }) {
  const bg = !isOpen ? 'var(--color-bg-disabled-default)' : isSelected ? 'var(--color-bg-brand-primary-default)' : 'var(--color-bg-primary-inverse-default)';
  const text = 'var(--color-text-onbrand-default)';
  return (
    <div style={{
      width: 32, height: 40,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      cursor: 'pointer',
    }}>
      <div style={{
        width: 32, height: 32,
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}>
        <span style={{
          transform: 'rotate(45deg)',
          color: text,
          fontSize: 14,
          fontWeight: 800,
          fontFamily: 'var(--font-display)',
        }}>
          {number}
        </span>
      </div>
    </div>
  );
}

export function OrderScreen() {
  const navigate = useNavigate();
  const { getAllLocations, getFormattedAddress } = useLocationData();
  const { getFavoriteLocationId } = useUserData();
  const locations = getAllLocations();
  const favoriteId = getFavoriteLocationId();

  const [fulfillmentType, setFulfillmentType] = useState('pickup');
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(locations[0]?.id || null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(favoriteId ? [favoriteId] : []));
  const [selectedPickupMethod, setSelectedPickupMethod] = useState<string | undefined>();

  const handlePinClick = useCallback((locationId: string) => {
    setExpandedLocationId(prev => prev === locationId ? null : locationId);
  }, []);

  // Center map on Columbus, OH area
  const centerLat = locations.reduce((s, l) => s + l.coordinates.lat, 0) / locations.length;
  const centerLng = locations.reduce((s, l) => s + l.coordinates.lng, 0) / locations.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopAppBar
        titleMode="title"
        title="Order"
        titlePlacement="left"
        trailingContent={
          <SegmentedControl
            segments={[
              { id: 'pickup', label: 'Pickup' },
              { id: 'delivery', label: 'Delivery' },
            ]}
            activeSegment={fulfillmentType}
            onSegmentChange={setFulfillmentType}
            density="sm"
            colorScheme="onBrand"
          />
        }
      />

      {/* Search field */}
      <div className="px-wds-16 py-wds-8" style={{ backgroundColor: 'var(--color-bg-primary-default)', position: 'relative', zIndex: 5 }}>
        <TextField
          label="Search Location"
          placeholder="Search City, State, or Zip"
          leadingIcon="search"
          fullWidth
          persistLabel
        />
      </div>

      {/* Map — fills all remaining vertical space */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {MAPBOX_TOKEN ? (
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
              longitude: centerLng,
              latitude: centerLat,
              zoom: 10.5,
            }}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            attributionControl={false}
          >
            {locations.map((location, index) => (
              <Marker
                key={location.id}
                longitude={location.coordinates.lng}
                latitude={location.coordinates.lat}
                anchor="bottom"
                onClick={() => handlePinClick(location.id)}
              >
                <LocationPin
                  number={index + 1}
                  isSelected={expandedLocationId === location.id}
                  isOpen={location.isOpen}
                />
              </Marker>
            ))}
          </Map>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: '#e8e8e8' }}
          >
            <span className="font-body text-[14px]" style={{ color: 'var(--color-text-secondary-default)' }}>
              Map — Mapbox token required
            </span>
          </div>
        )}
      </div>

      {/* Bottom sheet with location cards */}
      <BottomSheet
        isOpen
        onClose={() => {}}
        height={420}
        maxHeight={85}
        showHandle
        scrollable
        showScrim={false}
      >
        <div>
          {locations.map((location, index) => (
            <OrderLocationCard
              key={location.id}
              number={index + 1}
              storeName={location.name}
              address={getFormattedAddress(location)}
              distance={location.distance}
              isExpanded={expandedLocationId === location.id}
              onToggle={() => setExpandedLocationId(
                expandedLocationId === location.id ? null : location.id
              )}
              isFavorited={favorites.has(location.id)}
              onFavoriteToggle={(fav) => {
                const next = new Set(favorites);
                fav ? next.add(location.id) : next.delete(location.id);
                setFavorites(next);
              }}
              labels={[
                ...(index === 0 ? [{ text: 'Nearest Location', state: 'success' as const }] : []),
                ...(!location.isOpen ? [{ text: 'Closed', state: 'caution' as const }] : []),
              ]}
              pickupMethods={getPickupMethods(location.fulfillmentMethods, location.isOpen)}
              selectedPickupMethod={selectedPickupMethod}
              onPickupMethodSelect={(methodId) => {
                setSelectedPickupMethod(methodId);
                navigate('/order/menu');
              }}
            />
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
