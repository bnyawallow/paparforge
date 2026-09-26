import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  stepVehiclePhysics, 
  DEFAULT_VEHICLE_CONFIG, 
  VehiclePhysicsConfig 
} from '../../lib/physics/collisionEngine';
import { vehicleSoundEngine } from '../../lib/physics/vehicleSoundEngine';

interface TouchControlInput {
  steer: number;
  throttle: number;
  brake: boolean;
}

interface VehiclePhysicsSceneControllerProps {
  touchInputRef: React.MutableRefObject<TouchControlInput>;
  resetTriggerRef: React.MutableRefObject<(() => void) | null>;
  toggleHeadlightsRef: React.MutableRefObject<(() => void) | null>;
}

export const VehiclePhysicsSceneController: React.FC<VehiclePhysicsSceneControllerProps> = ({
  touchInputRef,
  resetTriggerRef,
  toggleHeadlightsRef
}) => {
  const { camera } = useThree();
  const isDrivingActive = useEditorStore(state => state.isDrivingActive);
  const activeDrivingVehicleId = useEditorStore(state => state.activeDrivingVehicleId);
  const setDrivingActive = useEditorStore(state => state.setDrivingActive);
  const updateObject = useEditorStore(state => state.updateObject);
  const setVehicleDrivingTelemetry = useEditorStore(state => state.setVehicleDrivingTelemetry);
  
  // Current vehicle physical runtime state
  const currentSpeedRef = useRef<number>(0);
  const currentPosRef = useRef<[number, number, number]>([0, 0, 0]);
  const currentRotRef = useRef<[number, number, number]>([90, 0, 0]);
  const spawnPosRef = useRef<[number, number, number]>([0, 0, 0]);
  const spawnRotRef = useRef<[number, number, number]>([90, 0, 0]);
  const headlightsOnRef = useRef<boolean>(true);
  const isBrakingRef = useRef<boolean>(false);
  const lastSyncTimeRef = useRef<number>(0);
  const isDrivingActivePrevRef = useRef<boolean>(false);

  // Active keyboard state
  const keysPressedRef = useRef<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    space: boolean;
    horn: boolean;
  }>({
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
    horn: false
  });

  // Headlight spot light targets
  const headlightTargetLeftRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const headlightTargetRightRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const headlightSpotLeftRef = useRef<THREE.SpotLight>(null);
  const headlightSpotRightRef = useRef<THREE.SpotLight>(null);

  // Reset vehicle position to starting spawn point
  const handleResetVehicle = useCallback(() => {
    if (!activeDrivingVehicleId) return;
    currentSpeedRef.current = 0;
    currentPosRef.current = [...spawnPosRef.current];
    currentRotRef.current = [...spawnRotRef.current];
    updateObject(activeDrivingVehicleId, {
      position: [...spawnPosRef.current],
      rotation: [...spawnRotRef.current]
    });
    setVehicleDrivingTelemetry({
      speed: 0,
      gear: 'P',
      isColliding: false
    });
  }, [activeDrivingVehicleId, updateObject, setVehicleDrivingTelemetry]);

  // Toggle headlights
  const handleToggleHeadlights = useCallback(() => {
    headlightsOnRef.current = !headlightsOnRef.current;
    setVehicleDrivingTelemetry({ headlights: headlightsOnRef.current });
  }, [setVehicleDrivingTelemetry]);

  // Register external triggers
  useEffect(() => {
    resetTriggerRef.current = handleResetVehicle;
    toggleHeadlightsRef.current = handleToggleHeadlights;
  }, [handleResetVehicle, handleToggleHeadlights, resetTriggerRef, toggleHeadlightsRef]);

  // Setup Keyboard Event Listeners for Driving Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (!isDrivingActive) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          keysPressedRef.current.up = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          keysPressedRef.current.down = true;
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          keysPressedRef.current.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          keysPressedRef.current.right = true;
          e.preventDefault();
          break;
        case ' ':
          keysPressedRef.current.space = true;
          e.preventDefault();
          break;
        case 'h':
        case 'H':
          if (!keysPressedRef.current.horn) {
            keysPressedRef.current.horn = true;
            vehicleSoundEngine.startHorn();
          }
          break;
        case 'l':
        case 'L':
          handleToggleHeadlights();
          break;
        case 'Escape':
          setDrivingActive(false);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          keysPressedRef.current.up = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          keysPressedRef.current.down = false;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          keysPressedRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          keysPressedRef.current.right = false;
          break;
        case ' ':
          keysPressedRef.current.space = false;
          break;
        case 'h':
        case 'H':
          keysPressedRef.current.horn = false;
          vehicleSoundEngine.stopHorn();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDrivingActive, handleToggleHeadlights, setDrivingActive]);

  // Start / Stop audio and initialize spawn positions upon engaging driving mode
  useEffect(() => {
    if (isDrivingActive && !isDrivingActivePrevRef.current) {
      // Just engaged
      const state = useEditorStore.getState();
      const targetId = activeDrivingVehicleId;
      if (targetId && state.objects[targetId]) {
        const obj = state.objects[targetId];
        currentPosRef.current = [...obj.position];
        currentRotRef.current = [...obj.rotation];
        spawnPosRef.current = [...obj.position];
        spawnRotRef.current = [...obj.rotation];
        currentSpeedRef.current = 0;
        headlightsOnRef.current = obj.properties?.vehicleHeadlights !== false;

        if (obj.properties?.vehicleEngineSound !== false) {
          vehicleSoundEngine.startEngine();
        }
      }
    } else if (!isDrivingActive && isDrivingActivePrevRef.current) {
      // Just disengaged
      vehicleSoundEngine.stopEngine();
      vehicleSoundEngine.stopHorn();
      currentSpeedRef.current = 0;
    }
    isDrivingActivePrevRef.current = isDrivingActive;
  }, [isDrivingActive, activeDrivingVehicleId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      vehicleSoundEngine.stopEngine();
      vehicleSoundEngine.stopHorn();
    };
  }, []);

  // Main Vehicle Physics Frame Loop
  useFrame((state, delta) => {
    if (!isDrivingActive || !activeDrivingVehicleId) return;

    const editorState = useEditorStore.getState();
    const vehicleObj = editorState.objects[activeDrivingVehicleId];
    if (!vehicleObj) return;

    // 1. Gather combined inputs (Keyboard + On-Screen Touch)
    const touch = touchInputRef.current;
    const keys = keysPressedRef.current;

    // Steering input (-1 for Right, +1 for Left)
    let steerInput = 0;
    if (keys.left) steerInput += 1;
    if (keys.right) steerInput -= 1;
    if (touch.steer !== 0) steerInput = touch.steer;

    // Throttle input (+1 for Forward, -1 for Reverse)
    let throttleInput = 0;
    if (keys.up) throttleInput += 1;
    if (keys.down) throttleInput -= 1;
    if (touch.throttle !== 0) throttleInput = touch.throttle;

    // Braking
    const isBraking = keys.space || touch.brake;
    isBrakingRef.current = isBraking;

    // 2. Resolve Vehicle Physics Config
    const config: VehiclePhysicsConfig = {
      ...DEFAULT_VEHICLE_CONFIG,
      maxSpeed: typeof vehicleObj.properties?.vehicleMaxSpeed === 'number' ? vehicleObj.properties.vehicleMaxSpeed : DEFAULT_VEHICLE_CONFIG.maxSpeed,
      acceleration: typeof vehicleObj.properties?.vehicleAcceleration === 'number' ? vehicleObj.properties.vehicleAcceleration : DEFAULT_VEHICLE_CONFIG.acceleration,
      brakePower: typeof vehicleObj.properties?.vehicleBrakePower === 'number' ? vehicleObj.properties.vehicleBrakePower : DEFAULT_VEHICLE_CONFIG.brakePower,
      turnSpeed: typeof vehicleObj.properties?.vehicleTurnSpeed === 'number' ? vehicleObj.properties.vehicleTurnSpeed : DEFAULT_VEHICLE_CONFIG.turnSpeed,
      friction: typeof vehicleObj.properties?.vehicleFriction === 'number' ? vehicleObj.properties.vehicleFriction : DEFAULT_VEHICLE_CONFIG.friction,
      driftFactor: typeof vehicleObj.properties?.vehicleDriftFactor === 'number' ? vehicleObj.properties.vehicleDriftFactor : DEFAULT_VEHICLE_CONFIG.driftFactor,
      mass: typeof vehicleObj.properties?.mass === 'number' ? vehicleObj.properties.mass : DEFAULT_VEHICLE_CONFIG.mass,
      restitution: typeof vehicleObj.properties?.restitution === 'number' ? vehicleObj.properties.restitution : DEFAULT_VEHICLE_CONFIG.restitution,
      colliderPadding: vehicleObj.properties?.colliderPadding || DEFAULT_VEHICLE_CONFIG.colliderPadding,
      colliderOffset: vehicleObj.properties?.colliderOffset || DEFAULT_VEHICLE_CONFIG.colliderOffset,
      headlights: headlightsOnRef.current,
      engineSound: vehicleObj.properties?.vehicleEngineSound !== false,
      preventClipping: vehicleObj.properties?.preventClipping !== false,
      isObstacle: true
    };

    // 3. Step Physics Simulation with Collision Detection & Barrier Slopes
    const stepResult = stepVehiclePhysics(
      currentPosRef.current,
      currentRotRef.current,
      currentSpeedRef.current,
      steerInput,
      throttleInput,
      isBraking,
      delta,
      config,
      editorState.objects,
      activeDrivingVehicleId
    );

    currentPosRef.current = stepResult.nextPosition;
    currentRotRef.current = stepResult.nextRotation;
    currentSpeedRef.current = stepResult.nextVelocity;

    // 4. Update Gear and RPM Telemetry
    let currentGear = 'P';
    if (Math.abs(stepResult.nextVelocity) < 0.1 && throttleInput === 0) {
      currentGear = isBraking ? 'P' : 'N';
    } else if (stepResult.nextVelocity >= 0) {
      currentGear = 'D';
    } else {
      currentGear = 'R';
    }

    const now = performance.now();
    // Throttle store sync to 30fps for silky smooth React UI without re-render lags
    if (now - lastSyncTimeRef.current > 33) {
      lastSyncTimeRef.current = now;
      
      updateObject(activeDrivingVehicleId, {
        position: stepResult.nextPosition,
        rotation: stepResult.nextRotation
      });

      setVehicleDrivingTelemetry({
        speed: stepResult.nextVelocity,
        rpm: Math.abs(stepResult.nextVelocity) / config.maxSpeed,
        gear: currentGear,
        isColliding: stepResult.isColliding,
        headlights: headlightsOnRef.current,
        obstacleName: stepResult.collisionInfo?.obstacleName
      });
    }

    // 5. Position Dynamic Headlight Beams in 3D Space
    if (headlightSpotLeftRef.current && headlightSpotRightRef.current) {
      const headingRad = THREE.MathUtils.degToRad(stepResult.nextRotation[2]);
      const forwardX = -Math.sin(headingRad);
      const forwardY = Math.cos(headingRad);
      const rightX = Math.cos(headingRad);
      const rightY = Math.sin(headingRad);

      const posX = stepResult.nextPosition[0];
      const posY = stepResult.nextPosition[1];
      const posZ = stepResult.nextPosition[2] + 0.3;

      // Left headlight
      headlightSpotLeftRef.current.position.set(
        posX + forwardX * 0.8 - rightX * 0.35,
        posY + forwardY * 0.8 - rightY * 0.35,
        posZ
      );
      headlightTargetLeftRef.current.position.set(
        posX + forwardX * 6.0 - rightX * 0.35,
        posY + forwardY * 6.0 - rightY * 0.35,
        posZ - 0.2
      );

      // Right headlight
      headlightSpotRightRef.current.position.set(
        posX + forwardX * 0.8 + rightX * 0.35,
        posY + forwardY * 0.8 + rightY * 0.35,
        posZ
      );
      headlightTargetRightRef.current.position.set(
        posX + forwardX * 6.0 + rightX * 0.35,
        posY + forwardY * 6.0 + rightY * 0.35,
        posZ - 0.2
      );
    }
  });

  if (!isDrivingActive) return null;

  return (
    <group name="vehicle-physics-rig">
      {/* Target points for headlights */}
      <primitive object={headlightTargetLeftRef.current} />
      <primitive object={headlightTargetRightRef.current} />

      {/* Dynamic 3D Vehicle Headlights */}
      {headlightsOnRef.current && (
        <>
          <spotLight
            ref={headlightSpotLeftRef}
            target={headlightTargetLeftRef.current}
            color="#fef08a"
            intensity={4.5}
            distance={14}
            angle={Math.PI / 6}
            penumbra={0.4}
            castShadow
          />
          <spotLight
            ref={headlightSpotRightRef}
            target={headlightTargetRightRef.current}
            color="#fef08a"
            intensity={4.5}
            distance={14}
            angle={Math.PI / 6}
            penumbra={0.4}
            castShadow
          />
        </>
      )}
    </group>
  );
};
