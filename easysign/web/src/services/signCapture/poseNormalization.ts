import * as tf from '@tensorflow/tfjs';
import { Plane, Vector3 } from 'three';

export interface PlaneNormal {
  center: Vector3;
  direction: Vector3;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

function angle(n: number, d: number): number {
  return ((Math.atan2(n, d) * 180) / Math.PI + 360) % 360;
}

export function planeNormal(vectors: Vector3[], planeIdx: [number, number, number]): PlaneNormal {
  const triangle = planeIdx.map((i) => vectors[i]);
  const center = new Vector3(
    (triangle[0].x + triangle[1].x + triangle[2].x) / 3,
    (triangle[0].y + triangle[1].y + triangle[2].y) / 3,
    (triangle[0].z + triangle[1].z + triangle[2].z) / 3,
  );
  const plane = new Plane().setFromCoplanarPoints(triangle[0], triangle[1], triangle[2]);
  return { center, direction: plane.normal.clone() };
}

export function normalizeHand(
  vectors: Vector3[],
  normal: PlaneNormal,
  line: [number, number],
  center: number,
  flip: boolean,
): tf.Tensor {
  let matrix = tf.tensor2d(vectors.map((v) => [v.x, v.y, v.z]));

  const oldXAxis = new Vector3(1, 0, 0);
  const zAxis = normal.direction.clone().multiplyScalar(-1);
  const yAxis = new Vector3().crossVectors(oldXAxis, zAxis);
  const xAxis = new Vector3().crossVectors(zAxis, yAxis);

  const axis = tf.tensor2d([
    [xAxis.x, yAxis.x, zAxis.x],
    [xAxis.y, yAxis.y, zAxis.y],
    [xAxis.z, yAxis.z, zAxis.z],
  ]);

  matrix = matrix.sub(matrix.slice(0, 1)) as tf.Tensor2D;
  matrix = tf.dot(matrix, axis) as tf.Tensor2D;

  if (flip) {
    matrix = matrix.mul(tf.tensor2d([[-1, 1, 1]]));
  }

  const p1 = matrix.slice(line[0], 1);
  const p2 = matrix.slice(line[1], 1);
  const vec = p2.sub(p1).arraySync() as number[][];
  const rot = 90 + angle(vec[0][1], vec[0][0]);
  const sinAngle = Math.sin((rot * Math.PI) / 180);
  const cosAngle = Math.cos((rot * Math.PI) / 180);
  const rotationMatrix = tf.tensor2d([
    [cosAngle, -sinAngle, 0],
    [sinAngle, cosAngle, 0],
    [0, 0, 1],
  ]);

  matrix = matrix.dot(rotationMatrix) as tf.Tensor2D;

  const j1 = matrix.slice(line[0], 1);
  const j2 = matrix.slice(line[1], 1);
  const len = tf.pow(j2.sub(j1), 2).sum().sqrt();
  const scalingFactor = tf.scalar(200).div(len);
  matrix = matrix.mul(scalingFactor);

  return matrix.sub(matrix.slice(center, 1));
}

export function landmarksToVectors(landmarks: Landmark[], width: number, height: number): Vector3[] {
  return landmarks.map((l) => new Vector3(l.x * width, l.y * height, l.z * width));
}
