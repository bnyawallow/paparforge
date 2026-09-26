import * as THREE from 'three';
import { SceneObject } from '../../types';
import { vehicleSoundEngine } from './vehicleSoundEngine';

export interface BoundingBox3D {
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  size: [number, number, number];
  radius: number;
}

export interface OrientedBoundingBox3D {
  id: string;
  name: string;
  center: THREE.Vector3;
  halfExtents: THREE.Vector3;
  rotation: THREE.Quaternion;
  axes: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
  isObstacle: boolean;
  restitution: number;
  friction: number;
}

export interface CollisionContact {
  hasCollision: boolean;
  penetrationDepth: number;
  contactNormal: THREE.Vector3;
  contactPoint: THREE.Vector3;
  obstacleId?: string;
  obstacleName?: string;
}

export interface VehiclePhysicsConfig {
  maxSpeed: number;        // Max forward speed in units/s (default 12)
  reverseSpeed: number;    // Max reverse speed in units/s (default 6)
  acceleration: number;    // Forward acceleration in units/s^2 (default 18)
  brakePower: number;      // Braking deceleration (default 26)
  turnSpeed: number;       // Turn rate in rad/s (default 2.4)
  friction: number;        // Rolling resistance / drag (default 0.94)
  driftFactor: number;     // Lateral grip vs sliding (default 0.86)
  mass: number;            // Vehicle mass in kg (default 1200)
  restitution: number;     // Collision bounciness (default 0.2)
  colliderPadding: [number, number, number]; // [x, y, z] custom bbox padding
  colliderOffset: [number, number, number];  // [x, y, z] custom bbox offset
  headlights: boolean;
  engineSound: boolean;
  preventClipping: boolean;
  isObstacle: boolean;
}

export const DEFAULT_VEHICLE_CONFIG: VehiclePhysicsConfig = {
  maxSpeed: 14.0,
  reverseSpeed: 6.5,
  acceleration: 20.0,
  brakePower: 30.0,
  turnSpeed: 2.6,
  friction: 0.95,
  driftFactor: 0.88,
  mass: 1200,
  restitution: 0.22,
  colliderPadding: [0.1, 0.1, 0.1],
  colliderOffset: [0, 0, 0],
  headlights: true,
  engineSound: true,
  preventClipping: true,
  isObstacle: true
};

export const VEHICLE_PRESETS: Record<string, Partial<VehiclePhysicsConfig> & { label: string; icon: string; description: string }> = {
  sportscar: {
    label: 'Sports / GT Coupe',
    icon: '🏎️',
    description: 'High top speed, rapid acceleration, responsive steering, stiff suspension',
    maxSpeed: 22.0,
    reverseSpeed: 9.0,
    acceleration: 28.0,
    brakePower: 38.0,
    turnSpeed: 3.2,
    friction: 0.97,
    driftFactor: 0.92,
    mass: 1100,
    restitution: 0.2
  },
  offroad: {
    label: '4x4 SUV / Off-Roader',
    icon: '🚙',
    description: 'High torque, heavy mass, robust collision resistance, wide turning radius',
    maxSpeed: 14.0,
    reverseSpeed: 7.0,
    acceleration: 18.0,
    brakePower: 26.0,
    turnSpeed: 2.1,
    friction: 0.92,
    driftFactor: 0.82,
    mass: 2100,
    restitution: 0.15
  },
  motorcycle: {
    label: 'Superbike / Motorcycle',
    icon: '🏍️',
    description: 'Ultra-fast acceleration, nimble cornering, low inertia',
    maxSpeed: 24.0,
    reverseSpeed: 4.0,
    acceleration: 34.0,
    brakePower: 42.0,
    turnSpeed: 3.8,
    friction: 0.96,
    driftFactor: 0.94,
    mass: 240,
    restitution: 0.3
  },
  truck: {
    label: 'Commercial Truck / Hauler',
    icon: '🚚',
    description: 'Heavy inertia, gradual acceleration, powerful stopping power requirement',
    maxSpeed: 10.0,
    reverseSpeed: 4.5,
    acceleration: 10.0,
    brakePower: 22.0,
    turnSpeed: 1.5,
    friction: 0.90,
    driftFactor: 0.75,
    mass: 6500,
    restitution: 0.1
  },
  rover: {
    label: 'Sci-Fi Hovercraft / Rover',
    icon: '🛸',
    description: 'Zero surface friction, high drift momentum, smooth floating glide',
    maxSpeed: 18.0,
    reverseSpeed: 10.0,
    acceleration: 22.0,
    brakePower: 18.0,
    turnSpeed: 3.0,
    friction: 0.99,
    driftFactor: 0.65,
    mass: 800,
    restitution: 0.4
  }
};

/**
 * Extracts and calculates an Oriented Bounding Box (OBB) for any scene object
 */
export function computeOrientedBoundingBox(
  obj: SceneObject,
  customPadding: [number, number, number] = [0, 0, 0],
  customOffset: [number, number, number] = [0, 0, 0]
): OrientedBoundingBox3D {
  const pos = new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]);
  const rotEuler = new THREE.Euler(
    THREE.MathUtils.degToRad(obj.rotation[0]),
    THREE.MathUtils.degToRad(obj.rotation[1]),
    THREE.MathUtils.degToRad(obj.rotation[2]),
    'XYZ'
  );
  const quat = new THREE.Quaternion().setFromEuler(rotEuler);

  // Base dimensions based on object type and scale
  let baseWidth = 1.0;
  let baseLength = 1.0;
  let baseHeight = 1.0;

  switch (obj.type) {
    case 'box':
    case 'button':
      baseWidth = 1.0;
      baseLength = 1.0;
      baseHeight = 1.0;
      break;
    case 'sphere':
      baseWidth = 1.0;
      baseLength = 1.0;
      baseHeight = 1.0;
      break;
    case 'cylinder':
      baseWidth = 1.0;
      baseLength = 1.0;
      baseHeight = 1.0;
      break;
    case 'cone':
    case 'pyramid':
      baseWidth = 1.0;
      baseLength = 1.0;
      baseHeight = 1.0;
      break;
    case 'plane':
    case 'circle':
    case 'image':
    case 'video':
      baseWidth = 1.0;
      baseLength = 1.0;
      baseHeight = 0.1;
      break;
    case 'model':
      // 3D models default estimate or property overrides
      baseWidth = obj.properties?.customBoundsWidth || 1.2;
      baseLength = obj.properties?.customBoundsLength || 2.4;
      baseHeight = obj.properties?.customBoundsHeight || 1.1;
      break;
    default:
      baseWidth = 1.0;
      baseLength = 1.0;
      baseHeight = 1.0;
      break;
  }

  // Multiply by scale
  const sx = Math.abs(obj.scale[0]) * baseWidth + customPadding[0];
  const sy = Math.abs(obj.scale[1]) * baseLength + customPadding[1];
  const sz = Math.abs(obj.scale[2]) * baseHeight + customPadding[2];

  // Apply custom offset in local space
  const offsetVec = new THREE.Vector3(customOffset[0], customOffset[1], customOffset[2]).applyQuaternion(quat);
  const center = pos.clone().add(offsetVec);

  const halfExtents = new THREE.Vector3(Math.max(0.05, sx * 0.5), Math.max(0.05, sy * 0.5), Math.max(0.05, sz * 0.5));

  const xAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(quat).normalize();
  const yAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(quat).normalize();
  const zAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(quat).normalize();

  const isObstacle = obj.properties?.isObstacle !== false && obj.type !== 'imageTarget' && obj.visible !== false;
  const restitution = typeof obj.properties?.restitution === 'number' ? obj.properties.restitution : 0.2;
  const friction = typeof obj.properties?.friction === 'number' ? obj.properties.friction : 0.8;

  return {
    id: obj.id,
    name: obj.name,
    center,
    halfExtents,
    rotation: quat,
    axes: [xAxis, yAxis, zAxis],
    isObstacle,
    restitution,
    friction
  };
}

/**
 * Separating Axis Theorem (SAT) implementation to test collision between two Oriented Bounding Boxes (OBBs).
 * Returns contact normal and penetration depth if intersecting.
 */
export function testOBBIntersection(boxA: OrientedBoundingBox3D, boxB: OrientedBoundingBox3D): CollisionContact {
  const result: CollisionContact = {
    hasCollision: false,
    penetrationDepth: 0,
    contactNormal: new THREE.Vector3(0, 0, 1),
    contactPoint: new THREE.Vector3(),
    obstacleId: boxB.id,
    obstacleName: boxB.name
  };

  const deltaCenter = new THREE.Vector3().subVectors(boxB.center, boxA.center);

  // 15 potential separating axes in 3D SAT for two oriented boxes:
  // 3 from Box A, 3 from Box B, 9 cross products (A.axis x B.axis)
  const axesToTest: THREE.Vector3[] = [];

  // Face normals of Box A
  for (let i = 0; i < 3; i++) {
    axesToTest.push(boxA.axes[i].clone().normalize());
  }

  // Face normals of Box B
  for (let i = 0; i < 3; i++) {
    axesToTest.push(boxB.axes[i].clone().normalize());
  }

  // Edge cross-product axes
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cross = new THREE.Vector3().crossVectors(boxA.axes[i], boxB.axes[j]);
      if (cross.lengthSq() > 0.0001) {
        axesToTest.push(cross.normalize());
      }
    }
  }

  let minPenetration = Infinity;
  let bestNormal = new THREE.Vector3();

  for (const axis of axesToTest) {
    // Project Box A on axis
    const projA = 
      Math.abs(axis.dot(boxA.axes[0])) * boxA.halfExtents.x +
      Math.abs(axis.dot(boxA.axes[1])) * boxA.halfExtents.y +
      Math.abs(axis.dot(boxA.axes[2])) * boxA.halfExtents.z;

    // Project Box B on axis
    const projB = 
      Math.abs(axis.dot(boxB.axes[0])) * boxB.halfExtents.x +
      Math.abs(axis.dot(boxB.axes[1])) * boxB.halfExtents.y +
      Math.abs(axis.dot(boxB.axes[2])) * boxB.halfExtents.z;

    // Distance between box centers along this axis
    const dist = Math.abs(deltaCenter.dot(axis));

    const overlap = (projA + projB) - dist;

    // If there is any axis with no overlap (overlap <= 0), there is a separating axis => NO COLLISION
    if (overlap <= 0.001) {
      return result;
    }

    if (overlap < minPenetration) {
      minPenetration = overlap;
      bestNormal = axis.clone();
      if (deltaCenter.dot(bestNormal) < 0) {
        bestNormal.negate();
      }
    }
  }

  result.hasCollision = true;
  result.penetrationDepth = minPenetration;
  result.contactNormal = bestNormal;
  result.contactPoint = boxA.center.clone().add(bestNormal.clone().multiplyScalar(minPenetration * 0.5));

  return result;
}

/**
 * Gathers all solid obstacles in the scene that can collide with a vehicle
 */
export function getSceneObstacleBoxes(
  allObjects: Record<string, SceneObject>,
  excludeId: string
): OrientedBoundingBox3D[] {
  const obstacles: OrientedBoundingBox3D[] = [];

  for (const id of Object.keys(allObjects)) {
    if (id === excludeId) continue;
    const obj = allObjects[id];
    if (!obj || !obj.visible || obj.type === 'imageTarget' || obj.type === 'light' || obj.type === 'audio' || obj.type === 'camera') {
      continue;
    }

    // Check if user explicitly set isObstacle or if standard solid object
    const isObstacle = obj.properties?.isObstacle !== false;
    if (isObstacle) {
      const padding: [number, number, number] = obj.properties?.colliderPadding || [0, 0, 0];
      const offset: [number, number, number] = obj.properties?.colliderOffset || [0, 0, 0];
      const box = computeOrientedBoundingBox(obj, padding, offset);
      obstacles.push(box);
    }
  }

  return obstacles;
}

/**
 * Full physics step & collision resolver for an active vehicle
 * Resolves movement, turns, acceleration, obstacles, and sliding along bounding boxes.
 */
export function stepVehiclePhysics(
  currentPos: [number, number, number],
  currentRot: [number, number, number], // Euler degrees [x, y, z]
  currentVelocity: number,              // Current forward/backward speed
  steerAngle: number,                   // User steering input (-1 to +1)
  throttleInput: number,                // User throttle (-1 to +1, where +1 is forward, -1 is reverse)
  isBraking: boolean,                   // User handbrake/footbrake active
  deltaTime: number,                    // Frame delta in seconds
  config: VehiclePhysicsConfig,
  allObjects: Record<string, SceneObject>,
  vehicleId: string
): {
  nextPosition: [number, number, number];
  nextRotation: [number, number, number];
  nextVelocity: number;
  isColliding: boolean;
  collisionInfo?: CollisionContact;
} {
  const dt = Math.min(deltaTime, 0.1); // Cap delta to prevent tunneling on frame hitch

  // 1. Acceleration and speed update
  let vel = currentVelocity;
  if (isBraking) {
    const brakeDecel = config.brakePower * dt;
    if (vel > 0) vel = Math.max(0, vel - brakeDecel);
    else if (vel < 0) vel = Math.min(0, vel + brakeDecel);
    if (Math.abs(vel) > 3.0) {
      vehicleSoundEngine.playTireScreech(0.2);
    }
  } else if (throttleInput > 0) {
    // Accelerate forward
    vel = Math.min(config.maxSpeed, vel + config.acceleration * throttleInput * dt);
  } else if (throttleInput < 0) {
    // Reverse
    vel = Math.max(-config.reverseSpeed, vel + config.acceleration * throttleInput * dt);
  } else {
    // Natural friction / rolling drag
    vel *= Math.pow(config.friction, dt * 60);
    if (Math.abs(vel) < 0.05) vel = 0;
  }

  // 2. Yaw Steering calculation (Z-axis rotation in Z-up system)
  let rotZ = currentRot[2];
  let rotX = currentRot[0];
  let rotY = currentRot[1];

  if (Math.abs(vel) > 0.1 && Math.abs(steerAngle) > 0.01) {
    const speedRatio = Math.min(1.0, Math.abs(vel) / (config.maxSpeed * 0.5));
    const directionSign = vel >= 0 ? 1 : -1;
    const turnDelta = steerAngle * config.turnSpeed * speedRatio * directionSign * dt;
    rotZ += THREE.MathUtils.radToDeg(turnDelta);
  }

  // 3. Compute forward direction vector
  // In Z-up coordinate system where orientation is [90, 0, rotZ]
  // Forward movement is along the vehicle's heading angle on the XY plane
  const headingRad = THREE.MathUtils.degToRad(rotZ);
  // Heading vector: cos(heading), sin(heading)
  const forwardX = -Math.sin(headingRad);
  const forwardY = Math.cos(headingRad);

  const moveDist = vel * dt;
  const candidatePosX = currentPos[0] + forwardX * moveDist;
  const candidatePosY = currentPos[1] + forwardY * moveDist;
  const candidatePosZ = currentPos[2];

  // 4. Construct candidate vehicle oriented bounding box
  const candidateObj: SceneObject = {
    id: vehicleId,
    name: 'ActiveVehicle',
    type: 'model',
    position: [candidatePosX, candidatePosY, candidatePosZ],
    rotation: [rotX, rotY, rotZ],
    scale: allObjects[vehicleId]?.scale || [1, 1, 1],
    visible: true,
    children: [],
    parentId: null,
    properties: {
      customBoundsWidth: allObjects[vehicleId]?.properties?.customBoundsWidth || 1.2,
      customBoundsLength: allObjects[vehicleId]?.properties?.customBoundsLength || 2.4,
      customBoundsHeight: allObjects[vehicleId]?.properties?.customBoundsHeight || 1.1,
      colliderPadding: config.colliderPadding,
      colliderOffset: config.colliderOffset
    }
  };

  const vehicleOBB = computeOrientedBoundingBox(candidateObj, config.colliderPadding, config.colliderOffset);
  const obstacles = getSceneObstacleBoxes(allObjects, vehicleId);

  let collisionResult: CollisionContact | undefined;
  let finalPosX = candidatePosX;
  let finalPosY = candidatePosY;
  let finalPosZ = candidatePosZ;
  let finalVel = vel;

  // 5. Test collision against all obstacles
  for (const obstacle of obstacles) {
    const hit = testOBBIntersection(vehicleOBB, obstacle);
    if (hit.hasCollision) {
      collisionResult = hit;

      // Play collision crunch audio & trigger haptic
      const hitIntensity = Math.min(1.0, Math.abs(vel) / (config.maxSpeed * 0.4));
      vehicleSoundEngine.playCollisionImpact(hitIntensity);

      if (navigator.vibrate) {
        try { navigator.vibrate(Math.min(120, Math.max(30, hitIntensity * 100))); } catch {}
      }

      // Continuous Collision & Sliding Resolution:
      // Project candidate movement out along collision normal to stop penetration
      const normal = hit.contactNormal.clone();
      // Only resolve in planar driving axes (X and Y in Z-up system)
      normal.z = 0;
      if (normal.lengthSq() > 0.001) {
        normal.normalize();

        // Push vehicle out by penetration depth + slight safety margin
        const pushDistance = hit.penetrationDepth + 0.02;
        finalPosX -= normal.x * pushDistance;
        finalPosY -= normal.y * pushDistance;

        // Tangential sliding: Remove velocity component pushing into obstacle
        const velVec = new THREE.Vector2(forwardX * vel, forwardY * vel);
        const normal2D = new THREE.Vector2(normal.x, normal.y);
        const dot = velVec.dot(normal2D);

        if (dot > 0) {
          // Subtract normal velocity component to slide smoothly along obstacle wall
          velVec.sub(normal2D.multiplyScalar(dot * (1 + obstacle.restitution)));
          // Apply friction dampening
          velVec.multiplyScalar(obstacle.friction);
          finalVel = velVec.length() * (vel >= 0 ? 1 : -1) * 0.6;
        } else {
          finalVel = -vel * obstacle.restitution * 0.5;
        }
      } else {
        // Fallback: reverse step
        finalPosX = currentPos[0];
        finalPosY = currentPos[1];
        finalVel = -vel * 0.3;
      }
      break;
    }
  }

  // Update engine sound RPM
  if (config.engineSound) {
    const speedRatio = Math.abs(finalVel) / config.maxSpeed;
    vehicleSoundEngine.updateRPM(speedRatio, Math.abs(throttleInput) > 0.1 && !isBraking);
  }

  return {
    nextPosition: [Number(finalPosX.toFixed(4)), Number(finalPosY.toFixed(4)), Number(finalPosZ.toFixed(4))],
    nextRotation: [rotX, rotY, Number(rotZ.toFixed(2))],
    nextVelocity: Number(finalVel.toFixed(3)),
    isColliding: !!(collisionResult && collisionResult.hasCollision),
    collisionInfo: collisionResult
  };
}
