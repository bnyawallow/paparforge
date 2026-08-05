const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM();
global.window = window;
global.document = window.document;

class FileReader {
    constructor() {}
    readAsArrayBuffer(blob) {
        // Mock FileReader for GLTFExporter
        blob.arrayBuffer().then(buffer => {
            this.result = buffer;
            if (this.onload) this.onload({ target: this });
        });
    }
}
global.FileReader = FileReader;
global.Blob = window.Blob;

const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');

const exporter = new GLTFExporter();
const iconsDir = path.join(__dirname, 'public/models/icons');
fs.mkdirSync(iconsDir, { recursive: true });

function exportMesh(mesh, filename) {
    exporter.parse(
        mesh,
        function (gltf) {
            fs.writeFileSync(path.join(iconsDir, filename), Buffer.from(gltf));
            console.log("Saved " + filename);
        },
        function (error) {
            console.error("Error exporting " + filename, error);
        },
        { binary: true }
    );
}

// 1. Rocket
const rocket = new THREE.Group();
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32));
const nose = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8, 32));
nose.position.y = 1.15;
rocket.add(body);
rocket.add(nose);
exportMesh(rocket, 'rocket.glb');

// 2. Spline Cubes
const cubes = new THREE.Group();
const cube1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8));
cube1.position.set(-0.3, 0.3, 0);
const cube2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6));
cube2.position.set(0.4, -0.4, 0.3);
cubes.add(cube1);
cubes.add(cube2);
exportMesh(cubes, 'spline_cubes.glb');

