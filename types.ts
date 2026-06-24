export interface Substitute {
  sku: string
  catalogName: string
  price: number
  qtyAvailable: number
  compatibility: 'Drop-in' | 'Minor Change'
  note: string
}

export interface EngineerLens {
  whatItDoes: string
  whyThisSpec: string
  whatChanges: string
}

export interface BOMItem {
  name: string
  spec: string
  quantity: number
  source: string
  sku: string | null
  catalogName: string | null
  price: number | null
  stock: boolean
  qtyAvailable: number
  matchType: 'Exact' | 'Fuzzy' | 'AI' | 'Not Found'
  substitutes?: Substitute[]
  engineerLens?: EngineerLens
}

export interface VideoMeta {
  title: string
  channel: string
  thumbnailUrl: string
}

export interface ExtractionResult {
  meta: VideoMeta
  bom: BOMItem[]
}

export type AppState = 'landing' | 'loading' | 'results'
