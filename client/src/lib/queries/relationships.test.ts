import { describe, it, expect } from 'vitest';
import {
  fetchRelationshipsForEntity,
  fetchPersonBySlug,
} from './relationships';

describe('relationships query module', () => {
  it('fetches bidirectional connections for a person', async () => {
    const ashokaId = 'p0000002-0000-0000-0000-000000000002';
    const connections = await fetchRelationshipsForEntity('person', ashokaId);

    expect(connections.length).toBeGreaterThan(0);
    const ruledConn = connections.find((c) => c.relationship === 'ruled');
    expect(ruledConn).toBeDefined();
    expect(ruledConn?.targetTitle).toBe('Mauryan Empire Founded');
  });

  it('fetches incoming connections for an event', async () => {
    const mauryanEmpireId = 'e0000015-0000-0000-0000-000000000015';
    const connections = await fetchRelationshipsForEntity('event', mauryanEmpireId);

    expect(connections.length).toBeGreaterThanOrEqual(2);
    const incomingFromChandragupta = connections.find(
      (c) => c.targetTitle === 'Chandragupta Maurya'
    );
    expect(incomingFromChandragupta).toBeDefined();
    expect(incomingFromChandragupta?.direction).toBe('incoming');
  });

  it('fetches person by slug correctly', async () => {
    const person = await fetchPersonBySlug('buddha');
    expect(person).not.toBeNull();
    expect(person?.name).toBe('Siddhartha Gautama (Buddha)');
  });
});
