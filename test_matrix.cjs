const THREE = require('three');
const parentWorld = new THREE.Matrix4().compose(new THREE.Vector3(0,0,0), new THREE.Quaternion(), new THREE.Vector3(2,2,2));
const childLocal = new THREE.Matrix4().compose(new THREE.Vector3(1,0,0), new THREE.Quaternion(), new THREE.Vector3(1,1,1));
const childWorld = parentWorld.clone().multiply(childLocal);
console.log(childWorld);

const newParentWorld = new THREE.Matrix4().identity();
const newChildLocal = newParentWorld.clone().invert().multiply(childWorld);

const p = new THREE.Vector3();
const q = new THREE.Quaternion();
const s = new THREE.Vector3();
newChildLocal.decompose(p, q, s);
console.log(p, q, s);
