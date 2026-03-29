/**
 * ─────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION
 *  Single source of truth for all cafe-specific content.
 *
 *  To replicate this site for a different cafe:
 *    1. Copy this file
 *    2. Replace every value below
 *    3. Swap images in /public/images/
 *    4. Done — no component files need touching
 * ─────────────────────────────────────────────────────────────
 */

import type { MenuGroup, MenuImageData } from '@/types/menu'

// ─── Types ───────────────────────────────────────────────────

export interface HoursCard {
  day: string
  time: string
}

export interface MenuSectionConfig {
  ariaLabel: string
  titleLines: string[]
  reverse?: boolean
  groups: MenuGroup[]
  images: MenuImageData[]
}

export interface SiteConfig {
  // ── Brand ───────────────────────────────────────────────
  name: string
  tagline: string

  // ── Contact ─────────────────────────────────────────────
  address: {
    text: string
    mapsUrl: string
  }
  phone: {
    display: string
    href: string
  }

  // ── Hero ────────────────────────────────────────────────
  hero: {
    /** Small label above the big logo, e.g. "Artisan Bakery" */
    logoLabel: string
    /** Each string becomes one animated word in the large logo */
    logoWords: string[]
    /** Screen-reader label for the h1 */
    ariaLabel: string
    media: {
      src: string
      alt: string
    }
    hours: {
      /** The large featured card shown first */
      featured: {
        title: string
        day: string
        time: string
      }
      /** Additional cards rendered beside the featured one */
      cards: HoursCard[]
    }
  }

  // ── About ────────────────────────────────────────────────
  about: {
    title: string
    subtitle: string
    body: string
    mainImage: { src: string; alt: string }
    accentImage: { src: string; alt: string }
  }

  // ── Footer ───────────────────────────────────────────────
  footer: {
    email: string
    instagram: string
    images: { src: string; alt: string }[]
    /** Optional video shown in the middle slot of the image grid (loops like a GIF) */
    midVideo?: string
  }

  // ── Menu Sections ────────────────────────────────────────
  /** Rendered in order — wrap them in JellyWrapper in page.tsx */
  menuSections: MenuSectionConfig[]
}

// ─── Bakery Config ────────────────────────────────────────────

export const siteConfig: SiteConfig = {

  name: 'Sour House',
  tagline: 'sourdough bakery & cafe.',

  address: {
    text: 'Koramangala, Bangalore',
    mapsUrl: 'https://maps.app.goo.gl/c7xatn3BTVjFhEFE9',
  },

  phone: {
    display: '+91-8050395841',
    href: 'tel:+918050395841',
  },

  // ── Hero ──────────────────────────────────────────────────
  hero: {
    logoLabel: 'Artisan Bakery',
    logoWords: ['SOUR', 'HOUSE'],
    ariaLabel: 'Sour House Bakery',
    media: {
      src: '/images/hero.webp',
      alt: 'Fresh pastries from Sour House',
    },
    hours: {
      featured: {
        title: 'Opening Hours',
        day: 'Fri – Sat',
        time: '8:30AM – 9:30PM',
      },
      cards: [
        { day: 'Mon', time: 'Closed' },
        { day: 'Tue – Thu', time: '8:30AM – 9:30PM' },
      ],
    },
  },

  // ── About ──────────────────────────────────────────────────
  about: {
    title: 'Our Story',
    subtitle: 'Sourdough baked with love',
    body: 'Sour House was born from a passion for slow fermentation and honest food. Every loaf, croissant, and ferment is made by hand using time-honoured techniques — no shortcuts, no compromises. We bake because we love it, and we hope you taste that in every bite.',
    mainImage: { src: '/images/about.webp', alt: 'Sour House' },
    accentImage: { src: '/images/croissant.webp', alt: 'Flaky butter croissant' },
  },

  // ── Footer ─────────────────────────────────────────────────
  footer: {
    email: 'hello@sourhouse.in',
    instagram: 'https://www.instagram.com/sourhouse_india',
    images: [
      { src: '/images/sourhouse1.webp', alt: 'Sourdough loaf' },
      { src: '/images/croissant.mp4', alt: 'Butter croissant' },
      { src: '/images/sourhouse2.webp', alt: 'Brioche' },
    ],
  },

  // ── Menu Sections ─────────────────────────────────────────
  menuSections: [
    {
      ariaLabel: 'Le Fournil',
      titleLines: ['Le', 'Fournil'],
      groups: [
        {
          title: 'Breads',
          items: [
            { name: 'Bagel', price: '₹90' },
            { name: 'Baguette', price: '₹160' },
            { name: 'Ciabatta', price: '₹70' },
            { name: 'Country Sourdough', price: '₹190' },
            { name: 'Dark Sourdough', price: '₹210' },
            { name: 'Focaccia', price: '₹120' },
            { name: 'Milk Loaf', price: '₹150' },
            { name: 'Olive & Rosemary Sourdough', price: '₹230' },
            { name: 'Seeded Sourdough', price: '₹220' },
            { name: 'Spicy Sourdough', price: '₹220' },
            { name: 'Whole Wheat Sourdough', price: '₹210' },
          ],
        },
        {
          title: 'Pastry',
          items: [
            { name: 'Almond Croissant', price: '₹170' },
            { name: 'Blueberry Croissant', price: '₹185' },
            { name: 'Butter Croissant', price: '₹120' },
            { name: 'Choco Chip & Walnut Cookie', price: '₹80' },
            { name: 'Cinnamon Swirls', price: '₹150' },
            { name: 'Coffee Caramel Croissant', price: '₹200' },
            { name: 'Guava Chili Croissant', price: '₹220' },
            { name: 'Honey & Sea Salt Croissant', price: '₹130' },
            { name: 'Hot Cross Buns', price: '₹110' },
            { name: 'Lemon Curd Croissant', price: '₹150' },
            { name: 'Pain Au Chocolat', price: '₹150' },
            { name: 'Pistachio Croissant', price: '₹280' },
            { name: 'Raw Mango Croissant', price: '₹170' },
            { name: 'Spicy Egg Puff', price: '₹90' },
            { name: 'Strawberry Croissant', price: '₹230' },
            { name: 'Strawberry Suisse', price: '₹250' },
            { name: 'Veg Puff', price: '₹90' },
          ],
        },
        {
          title: 'Cake',
          items: [
            { name: 'Banana Walnut Cake Slice', price: '₹100' },
            { name: 'Basque Chocolate Cheesecake', price: '₹310' },
            { name: 'Carrot Cake Slice (100% Wholewheat)', price: '₹100' },
            { name: 'Lemon Cake Slice', price: '₹100' },
          ],
        },
      ],
      images: [
        { src: '/images/bread.webp', alt: 'Fresh-baked sourdough loaf' },
        { src: '/images/lotus-biscoff.webp', alt: 'Flaky butter croissant' },
        { src: '/images/brioche.webp', alt: 'Artisan pastries on display' },
      ],
    },

    {
      ariaLabel: 'Vivant',
      titleLines: ['Vi', 'vant'],
      reverse: true,
      groups: [
        {
          title: 'Drinks',
          items: [
            { name: 'Ginger Ale', desc: 'Naturally fermented, fresh ginger. 250ml', price: '₹120' },
            { name: 'Milk Kefir', desc: 'Probiotic milk fermented with kefir grains', price: '₹120' },
          ],
        },
        {
          title: 'Fermented',
          items: [
            { name: 'Hung Curd', desc: 'Creamy yogurt dip with garlic & spices', price: '₹160' },
            { name: 'Kimchi', desc: 'Vegan kimchi with fresh vegetables', price: '₹200' },
            { name: 'Pizza Dough', desc: 'Fermented dough — makes 4 small pizzas', price: '₹160' },
          ],
        },
        {
          title: 'Sides & Snacks',
          items: [
            { name: 'Sourdough Cheese Crackers', desc: 'Classic crackers topped with cheddar', price: '₹120' },
            { name: 'Sourdough Crackers', desc: 'Crunchy, made with sourdough starter', price: '₹100' },
          ],
        },
        {
          title: 'Culture',
          items: [
            { name: 'Kombucha Kit', desc: 'SCOBY & starter to ferment kombucha at home', price: '₹300' },
          ],
        },
      ],
      images: [
        { src: '/images/milk.webp', alt: 'Milk kefir in glass jar' },
        { src: '/images/kimchi.webp', alt: 'Freshly made kimchi' },
        { src: '/images/kombucha.webp', alt: 'Kombucha brewing kit' },
      ],
    },
  ],
}
