import { describe, it, expect } from 'vitest';
import { layoutLaneNodes } from './layoutNodes';
import type { TimelineEvent } from './types/database.types';

describe('layoutNodes module', () => {
  it('places far apart events in depthRow 0 (Horizontal Spread Regression Test)', () => {
    const cosmicEvents: Partial<TimelineEvent>[] = [
      { id: 'e1', date: { years_before_present: 13_800_000_000 } as any }, // Big Bang (~0px)
      { id: 'e2', date: { years_before_present: 4_540_000_000 } as any },  // Earth (~171px)
      { id: 'e3', date: { years_before_present: 541_000_000 } as any },    // Cambrian (~499px)
      { id: 'e4', date: { years_before_present: 66_000_000 } as any },     // Dinosaurs (~2088px)
      { id: 'e5', date: { years_before_present: 300_000 } as any },        // Homo Sapiens (~2952px)
    ];

    const { nodes, maxDepthRow } = layoutLaneNodes(cosmicEvents as TimelineEvent[], 3600, 100);
    expect(nodes.length).toBe(5);

    // Assert that events far apart in pixels share depthRow = 0 (horizontal spread, zero vertical column stacking)
    for (const node of nodes) {
      expect(node.depthRow).toBe(0);
    }
    expect(maxDepthRow).toBe(0);

    // Assert that leftPx positions differ significantly across deep time
    expect(nodes[1].leftPx - nodes[0].leftPx).toBeGreaterThan(150);
    expect(nodes[2].leftPx - nodes[1].leftPx).toBeGreaterThan(200);
  });

  it('staggers overlapping close-together events into higher depthRows', () => {
    const events: Partial<TimelineEvent>[] = [
      { id: 'e1', date: { years_before_present: 100 } as any },
      { id: 'e2', date: { years_before_present: 99.999 } as any },
      { id: 'e3', date: { years_before_present: 99.998 } as any },
    ];

    const { nodes, maxDepthRow } = layoutLaneNodes(events as TimelineEvent[], 2400, 100);
    expect(nodes.length).toBe(3);
    expect(nodes[0].depthRow).toBe(0);
    expect(nodes[1].depthRow).toBe(1);
    expect(nodes[2].depthRow).toBe(2);
    expect(maxDepthRow).toBe(2);
  });
});
