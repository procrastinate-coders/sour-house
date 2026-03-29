/** Shared data types for menu sections */

export interface MenuItemData {
  name:   string
  desc?:  string
  price:  string
}

export interface MenuGroup {
  title:   string
  /** Optional format label shown beside the title, e.g. "12 oz" */
  format?: string
  items:   MenuItemData[]
}

export interface MenuImageData {
  src: string
  alt: string
}
