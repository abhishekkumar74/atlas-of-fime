export type DatePrecision =
  | 'exact'
  | 'year'
  | 'decade'
  | 'century'
  | 'millennium'
  | 'mya'
  | 'bya'
  | 'range';

export type CalendarType = 'ce_bce' | 'ya';

export type DateConfidence =
  | 'well_established'
  | 'probable'
  | 'debated'
  | 'traditional'
  | 'legendary';

export type ContentStatus = 'draft' | 'review' | 'approved' | 'published';

export type EntityType = 'event' | 'person' | 'civilization' | 'religion';

export type RelationshipType =
  | 'caused'
  | 'influenced'
  | 'preceded'
  | 'followed'
  | 'participated_in'
  | 'ruled'
  | 'founded'
  | 'conquered'
  | 'allied_with'
  | 'succeeded'
  | 'inspired'
  | 'occurred_during'
  | 'geographically_overlapped';

export type CivilizationKind =
  | 'civilization'
  | 'empire'
  | 'kingdom'
  | 'dynasty'
  | 'country';

export type SourceType =
  | 'book'
  | 'academic_paper'
  | 'archaeological_report'
  | 'primary_text'
  | 'reference';

export type UserRole = 'user' | 'editor' | 'admin';

export interface EventRecord {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string | null;
  category: string;
  created_at: string;
  status: ContentStatus;
}

export interface EventDateRecord {
  id: string;
  event_id: string;
  precision: DatePrecision;
  calendar: CalendarType;
  year_start: number;
  year_end: number | null;
  years_before_present: number;
  confidence: DateConfidence;
  confidence_note: string | null;
  is_primary: boolean;
}

export interface LayerRecord {
  id: string;
  key: string;
  label: string;
  sort_order: number;
}

export interface EventLayerRecord {
  event_id: string;
  layer_id: string;
}

export interface TimelineEvent extends EventRecord {
  date: EventDateRecord;
  layers: LayerRecord[];
}

export interface PersonRecord {
  id: string;
  name: string;
  slug: string;
  alt_names: string[];
  birth_event_id: string | null;
  death_event_id: string | null;
  summary: string;
  body: string | null;
  status: ContentStatus;
}

export interface EntityRelationshipRecord {
  id: string;
  from_type: EntityType;
  from_id: string;
  to_type: EntityType;
  to_id: string;
  relationship: RelationshipType;
  note: string | null;
}

export interface ResolvedConnection {
  id: string;
  direction: 'outgoing' | 'incoming';
  relationship: RelationshipType;
  targetType: EntityType;
  targetId: string;
  targetTitle: string;
  targetSlug: string;
  targetYear?: string;
  targetYearsBP?: number;
  note: string | null;
}

export interface RegionRecord {
  id: string;
  key: string;
  label: string;
  x: number;
  y: number;
  lng?: number;
  lat?: number;
}

export interface CivilizationRecord {
  id: string;
  name: string;
  kind: CivilizationKind;
  summary: string;
  status: ContentStatus;
}

export interface TerritoryRecord {
  id: string;
  civilization_id: string;
  region_id: string;
  start_year: number;
  end_year: number | null;
  region_note: string | null;
  uncertainty_note: string;
}

export interface EventTerritoryRecord {
  event_id: string;
  territory_id: string;
  is_primary: boolean;
}

export interface MapPinState {
  primaryRegion: RegionRecord | null;
  secondaryRegions: RegionRecord[];
  civilization: CivilizationRecord | null;
  territory: TerritoryRecord | null;
  uncertaintyNote: string | null;
}

export interface SourceRecord {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  url: string | null;
  source_type: SourceType;
  published_at: string | null;
}

export interface EventSourceRecord {
  event_id: string;
  source_id: string | null;
  claim_note: string | null;
  no_source_flag: boolean;
}

export interface ResolvedSource {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  url: string | null;
  sourceType: SourceType;
  publishedAt: string | null;
  claimNote: string | null;
  noSourceFlag: boolean;
}

export interface UnifiedSearchResult {
  id: string;
  entityType: EntityType;
  title: string;
  slug: string;
  summary: string;
  year?: string;
  yearsBP?: number;
  matchedField: 'title-prefix' | 'title-contains' | 'year' | 'text';
  score: number;
  targetUrl: string;
}

export interface ProfileRecord {
  id: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface PublishValidationResult {
  eligible: boolean;
  errors: string[];
}

export interface AIHistorianCitation {
  id: string;
  entityType: EntityType;
  slug: string;
  title: string;
  targetUrl: string;
  confidence?: DateConfidence | null;
}

export interface AIHistorianResponse {
  answer: string;
  citations: AIHistorianCitation[];
  refused: boolean;
  refusalReason?: string;
}

export interface AIQueryLogRecord {
  id: string;
  user_id: string;
  question: string;
  retrieved_entity_ids: string[];
  answer: string;
  citations: AIHistorianCitation[];
  created_at: string;
}
