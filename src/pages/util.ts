import { FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";

interface Things {
  cx: number;
  cy: number;
  distance: number;
}

interface Connection {
  start: number;
  end: number;
}

const meh = 1;

export function extractThings(landmark: NormalizedLandmark[]): Things {
  const left = pointSet(landmark, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS);
  const right = pointSet(landmark, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS);

  const { height } = bounds(right);

  const distance = meh / height;

  const { cx, cy } = bounds(new Set([...left, ...right]));

  return {
    cx,
    cy,
    distance,
  };
}

function pointSet(landmark: NormalizedLandmark[], connection: Connection[]) {
  const points = new Set<NormalizedLandmark>();

  for (const { start, end } of connection) {
    points.add(landmark[start]);
    points.add(landmark[end]);
  }

  return points;
}

function bounds(points: Set<NormalizedLandmark>) {
  const _min = min(points);
  const _max = max(points);

  return {
    cx: _min.x + (_max.x - _min.x) / 2,
    cy: _min.y + (_max.y - _min.y) / 2,
    width: _max.x - _min.x,
    height: _max.y - _min.y,
  };
}

function min(points: Set<NormalizedLandmark>): NormalizedLandmark {
  return Array.from(points).reduce((acc, next) => {
    return {
      x: Math.min(acc.x, next.x),
      y: Math.min(acc.y, next.y),
      z: Math.min(acc.z, next.z),
      visibility: acc.visibility,
    };
  });
}

function max(points: Set<NormalizedLandmark>): NormalizedLandmark {
  return Array.from(points).reduce((acc, next) => {
    return {
      x: Math.max(acc.x, next.x),
      y: Math.max(acc.y, next.y),
      z: Math.max(acc.z, next.z),
      visibility: acc.visibility,
    };
  });
}
