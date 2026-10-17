export type CatalogueItem = {
  id: string;
  title: string;
  year: number | null;
  decade: string;
  description: string;
  runtimeSeconds: number | null;
  width: number | null;
  height: number | null;
  posterUrl: string;
  streamUrl: string;
  downloadUrl: string;
  collections: string[];
  subjectTags: string[];
  genre: string;
  licence: string;
  sourceUrl: string;
};

export type Catalogue = {
  generatedAt: string;
  source: string;
  collections: string[];
  stats: { scanned: number; selected: number; skipped: number };
  items: CatalogueItem[];
};
