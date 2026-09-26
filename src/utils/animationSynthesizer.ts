import * as THREE from 'three';

/**
 * Generates an expressive, valid Three.js AnimationClip with keyframe tracks
 * when a 3D model does not natively contain skeletal tracks for a requested clip name
 * (such as VisorOpen, VisorClose, HUDScan, Spin, Bounce, Flex, Wave, etc.).
 * 
 * Ensures the Three.js AnimationMixer has real, evaluatable AnimationActions
 * with accurate durations, keyframe markers, and transform updates.
 */
export function createSyntheticAnimationClip(
  clipName: string,
  rootObject?: THREE.Object3D
): THREE.AnimationClip {
  const normName = (clipName || 'default').trim();
  const lower = normName.toLowerCase();

  // In Three.js AnimationMixer, '.propertyName' targets mixer.getRoot() directly
  const pProp = '.position';
  const qProp = '.quaternion';
  const sProp = '.scale';

  let duration = 1.5;
  let times: number[] = [0, 0.35, 0.75, 1.15, 1.5];
  let pValues: number[] = [];
  let qValues: number[] = [];
  let sValues: number[] = [];

  const eulerToQuat = (x: number, y: number, z: number): [number, number, number, number] => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
    return [q.x, q.y, q.z, q.w];
  };

  if (lower.includes('visoropen') || lower.includes('openvisor') || lower.includes('visor_open')) {
    // Visor Opening motion: lifts and tilts upward smoothly over 1.5s
    duration = 1.5;
    times = [0, 0.35, 0.75, 1.15, 1.5];
    pValues = [
      0, 0, 0,
      0, -0.015, 0.02,
      0, -0.025, 0.04,
      0, -0.028, 0.045,
      0, -0.028, 0.045,
    ];
    const q0 = eulerToQuat(0, 0, 0);
    const q1 = eulerToQuat(0.18, 0, 0);
    const q2 = eulerToQuat(0.38, 0, 0);
    const q3 = eulerToQuat(0.44, 0, 0);
    const q4 = eulerToQuat(0.44, 0, 0);
    qValues = [...q0, ...q1, ...q2, ...q3, ...q4];
    sValues = [
      1, 1, 1,
      1, 1, 1,
      1, 1, 1,
      1, 1, 1,
      1, 1, 1,
    ];
  } else if (lower.includes('visorclose') || lower.includes('closevisor') || lower.includes('visor_close')) {
    // Visor Closing motion: reverses from open back down to flush position
    duration = 1.5;
    times = [0, 0.35, 0.75, 1.15, 1.5];
    pValues = [
      0, -0.028, 0.045,
      0, -0.025, 0.04,
      0, -0.015, 0.02,
      0, -0.002, 0.002,
      0, 0, 0,
    ];
    const q0 = eulerToQuat(0.44, 0, 0);
    const q1 = eulerToQuat(0.38, 0, 0);
    const q2 = eulerToQuat(0.18, 0, 0);
    const q3 = eulerToQuat(0.02, 0, 0);
    const q4 = eulerToQuat(0, 0, 0);
    qValues = [...q0, ...q1, ...q2, ...q3, ...q4];
    sValues = [
      1, 1, 1,
      1, 1, 1,
      1, 1, 1,
      1, 1, 1,
      1, 1, 1,
    ];
  } else if (lower.includes('scan') || lower.includes('hud') || lower.includes('pulse')) {
    // HUD Scan / Pulse: rhythmic scanning yaw rotation and subtle telemetry scale pulse
    duration = 2.0;
    times = [0, 0.5, 1.0, 1.5, 2.0];
    pValues = [
      0, 0, 0,
      0, 0, 0.01,
      0, 0, 0,
      0, 0, 0.01,
      0, 0, 0,
    ];
    const q0 = eulerToQuat(0, 0, 0);
    const q1 = eulerToQuat(0, 0, 0.12);
    const q2 = eulerToQuat(0, 0, 0);
    const q3 = eulerToQuat(0, 0, -0.12);
    const q4 = eulerToQuat(0, 0, 0);
    qValues = [...q0, ...q1, ...q2, ...q3, ...q4];
    sValues = [
      1, 1, 1,
      1.03, 1.03, 1.03,
      1, 1, 1,
      1.03, 1.03, 1.03,
      1, 1, 1,
    ];
  } else if (lower.includes('spin') || lower.includes('rotate')) {
    // 360 degree spin around Z axis (Z-up convention)
    duration = 2.0;
    times = [0, 0.5, 1.0, 1.5, 2.0];
    pValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const q0 = eulerToQuat(0, 0, 0);
    const q1 = eulerToQuat(0, 0, Math.PI * 0.5);
    const q2 = eulerToQuat(0, 0, Math.PI);
    const q3 = eulerToQuat(0, 0, Math.PI * 1.5);
    const q4 = eulerToQuat(0, 0, Math.PI * 2.0);
    qValues = [...q0, ...q1, ...q2, ...q3, ...q4];
    sValues = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  } else if (lower.includes('bounce') || lower.includes('jump')) {
    // Elastic vertical bounce
    duration = 1.0;
    times = [0, 0.25, 0.5, 0.75, 1.0];
    pValues = [
      0, 0, 0,
      0, 0, 0.08,
      0, 0, 0,
      0, 0, 0.03,
      0, 0, 0,
    ];
    const q0 = eulerToQuat(0, 0, 0);
    qValues = [...q0, ...q0, ...q0, ...q0, ...q0];
    sValues = [
      1.06, 1.06, 0.94,
      0.96, 0.96, 1.06,
      1.04, 1.04, 0.96,
      0.98, 0.98, 1.02,
      1, 1, 1,
    ];
  } else if (lower.includes('flex') || lower.includes('cushion')) {
    // Squash and stretch flexing
    duration = 1.2;
    times = [0, 0.3, 0.6, 0.9, 1.2];
    pValues = [0, 0, 0, 0, 0, -0.015, 0, 0, 0.02, 0, 0, -0.008, 0, 0, 0];
    const q0 = eulerToQuat(0, 0, 0);
    const q1 = eulerToQuat(-0.06, 0, 0);
    const q2 = eulerToQuat(0.08, 0, 0);
    const q3 = eulerToQuat(-0.02, 0, 0);
    const q4 = eulerToQuat(0, 0, 0);
    qValues = [...q0, ...q1, ...q2, ...q3, ...q4];
    sValues = [
      1, 1, 1,
      1.08, 1.08, 0.92,
      0.95, 0.95, 1.06,
      1.02, 1.02, 0.98,
      1, 1, 1,
    ];
  } else {
    // Generic smooth keyframe animation with keyframe markers
    duration = 1.5;
    times = [0, 0.375, 0.75, 1.125, 1.5];
    pValues = [
      0, 0, 0,
      0, 0, 0.02,
      0, 0, 0,
      0, 0, 0.015,
      0, 0, 0,
    ];
    const q0 = eulerToQuat(0, 0, 0);
    const q1 = eulerToQuat(0.08, 0.05, 0);
    const q2 = eulerToQuat(0, 0, 0);
    const q3 = eulerToQuat(-0.05, -0.03, 0);
    const q4 = eulerToQuat(0, 0, 0);
    qValues = [...q0, ...q1, ...q2, ...q3, ...q4];
    sValues = [
      1, 1, 1,
      1.02, 1.02, 1.02,
      1, 1, 1,
      1.01, 1.01, 1.01,
      1, 1, 1,
    ];
  }

  const tracks: THREE.KeyframeTrack[] = [
    new THREE.VectorKeyframeTrack(pProp, times, pValues),
    new THREE.QuaternionKeyframeTrack(qProp, times, qValues),
    new THREE.VectorKeyframeTrack(sProp, times, sValues),
  ];

  return new THREE.AnimationClip(normName, duration, tracks);
}
