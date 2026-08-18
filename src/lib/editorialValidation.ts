import type {
  EntityType,
  ContentStatus,
  TimelineEvent,
  PublishValidationResult,
} from './types/database.types';

export function canTransitionStatus(
  currentStatus: ContentStatus,
  targetStatus: ContentStatus
): boolean {
  if (currentStatus === targetStatus) return true;

  const validTransitions: Record<ContentStatus, ContentStatus[]> = {
    draft: ['review'],
    review: ['approved', 'draft'],
    approved: ['published', 'review'],
    published: ['draft', 'review'],
  };

  return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
}

export function validatePublishEligibility(
  entityType: EntityType,
  entityData: Partial<TimelineEvent>,
  existingEvents: TimelineEvent[],
  linkedSources: any[] = []
): PublishValidationResult {
  const errors: string[] = [];

  // 1. Slug uniqueness & format check
  const slug = entityData.slug?.trim().toLowerCase();
  if (!slug) {
    errors.push('Entity must have a valid non-empty slug.');
  } else {
    const isDuplicate = existingEvents.some(
      (e) => e.slug === slug && e.id !== entityData.id
    );
    if (isDuplicate) {
      errors.push(`Slug "${slug}" is already used by another entity.`);
    }
  }

  // 2. Date presence check (Required for events)
  if (entityType === 'event') {
    if (!entityData.date || typeof entityData.date.years_before_present !== 'number') {
      errors.push('Event must have a valid date record attached.');
    }
  }

  // 3. Source presence or explicit flag check
  const hasSource = linkedSources.some((s) => s.source_id || s.sourceId);
  const hasFlag = linkedSources.some((s) => s.no_source_flag || s.noSourceFlag);

  if (!hasSource && !hasFlag) {
    errors.push(
      'Publishing requires at least one linked academic source OR an explicit "no source yet" flag.'
    );
  }

  return {
    eligible: errors.length === 0,
    errors,
  };
}

export function filterPublishedEventsOnly(events: TimelineEvent[]): TimelineEvent[] {
  return events.filter((e) => e.status === 'published');
}
