const THREE = require('three');
const mat1 = new THREE.Matrix4().makeScale(2,2,2);
const mat2 = new THREE.Matrix4().makeTranslation(1,0,0);
console.log(mat1.multiply(mat2));
