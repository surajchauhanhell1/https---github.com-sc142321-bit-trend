// Centralized image URL resolver used across the app.
// It maps known files from `src/assets` to their built URLs so that
// database values like "/src/assets/product-mens-shirt.jpg" still render
// correctly in production builds.

// Import known assets so Vite bundles them and gives us stable URLs
import heroCosmetics from '@/assets/hero-cosmetics.jpg';
import heroFashion from '@/assets/hero-fashion.jpg';
import pikachu from '@/assets/pikachu.jpg';
import productCosmeticsLipstick from '@/assets/product-cosmetics-lipstick.jpg';
import productMensShirt from '@/assets/product-mens-shirt.jpg';
import productMensShoes from '@/assets/product-mens-shoes.jpg';
import productWomensDress from '@/assets/product-womens-dress.jpg';
import sun from '@/assets/sun.jpg';

const assetByBasename: Record<string, string> = {
  'hero-cosmetics.jpg': heroCosmetics,
  'hero-fashion.jpg': heroFashion,
  'pikachu.jpg': pikachu,
  'product-cosmetics-lipstick.jpg': productCosmeticsLipstick,
  'product-mens-shirt.jpg': productMensShirt,
  'product-mens-shoes.jpg': productMensShoes,
  'product-womens-dress.jpg': productWomensDress,
  'sun.jpg': sun,
};

export function resolveImageUrl(input?: string | null, fallback: string = '/placeholder.svg'): string {
  if (!input) return fallback;
  const value = String(input).trim();

  // If it's a data URL or http(s), return as-is
  if (/^(data:|https?:\/\/)/i.test(value)) return value;

  // If it points to src/assets or contains a known basename, map it
  const basename = value.split('/').pop() || value;
  if (assetByBasename[basename]) return assetByBasename[basename];

  // If it starts with a slash, assume it's a public/ path already
  if (value.startsWith('/')) return value;

  // Nothing matched – return fallback
  return fallback;
}

// Optionally normalize user-provided inputs before saving
export function normalizeImageInput(input: string): string {
  if (!input) return '';
  const value = input.trim();
  // If user pasted a /src/assets path, shrink it to the basename to allow resolver mapping
  if (value.startsWith('/src/assets/')) {
    return value.split('/').pop() || value;
  }
  return value;
}


