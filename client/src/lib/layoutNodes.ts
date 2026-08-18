import type { TimelineEvent } from './types/database.types';
import { yearsBPtoPos } from './dateEngine';

export interface PositionedNode {
  event: TimelineEvent;
  leftPosPercent: number;
  leftPx: number;
  depthRow: number;
}

/**
 * Calculates collision-free depthRow offsets for a list of timeline events in a lane.
 * @param events Timeline events assigned to the current lane
 * @param trackWidth Current width of the scrollable timeline track in pixels
 * @param cardWidth Width of the card label + minimum margin (e.g. 130px)
 */
export function layoutLaneNodes(
  events: TimelineEvent[],
  trackWidth: number,
  cardWidth = 130
): { nodes: PositionedNode[]; maxDepthRow: number } {
  if (events.length === 0) return { nodes: [], maxDepthRow: 0 };

  // 1. Calculate leftPx and sort by leftPx ascending
  const positioned = events.map((e) => {
    const leftPosPercent = yearsBPtoPos(e.date.years_before_present);
    const leftPx = (leftPosPercent / 100) * trackWidth;
    return {
      event: e,
      leftPosPercent,
      leftPx,
      depthRow: 0,
    };
  });

  positioned.sort((a, b) => a.leftPx - b.leftPx);

  // Track the rightmost X coordinate of the last placed card in each depth row
  const rowRightmostPx: number[] = [];
  let maxDepthRow = 0;

  // 2. Assign non-overlapping depthRow to each event node
  for (const node of positioned) {
    let assignedRow = 0;
    while (
      rowRightmostPx[assignedRow] !== undefined &&
      node.leftPx < rowRightmostPx[assignedRow]
    ) {
      assignedRow++;
    }

    node.depthRow = assignedRow;
    rowRightmostPx[assignedRow] = node.leftPx + cardWidth;
    if (assignedRow > maxDepthRow) {
      maxDepthRow = assignedRow;
    }
  }

  return { nodes: positioned, maxDepthRow };
}
