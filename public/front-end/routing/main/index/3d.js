import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.4.3/");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

let object;
const autoRotateGroup = new THREE.Group();
scene.add(autoRotateGroup);

let controls;

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load(`/models/sculpture/source/sculpture_compressed.glb`, (gltf) => {
        object = gltf.scene;

        object.traverse((child) => {
            if (child.isLight) {
                child.parent.remove(child);
            }
        });

        // object.traverse((child) => {
        //     if (child.isMesh) {
        //         child.material = new THREE.MeshStandardMaterial({
        //             color: 0xffffff,
        //             metalness: 0.3,
        //             roughness: 1,
        //         });
        //     }
        // });

        autoRotateGroup.add(object);
        fitObjectToView();
    },
    null,
    (error) => console.error(error)
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 0);

const element = document.getElementById("3D-object");
const container = element.parentElement;

function resizeRenderer() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
}

resizeRenderer();
element.appendChild(renderer.domElement);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(-500, 500, 500);
topLight.castShadow = true;
autoRotateGroup.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);

controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;

controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.NONE
};

let isUserInteracting = false;

controls.addEventListener('start', () => {
    isUserInteracting = true;
});

controls.addEventListener('end', () => {
    isUserInteracting = false;
});

function fitObjectToView() {
    if (!object) return;

    object.position.set(0, 0, 0);
    object.scale.set(1, 1, 1);

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);

    const maxSize = Math.max(size.x, size.y, size.z);
    const fov = (camera.fov * Math.PI) / 180;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const containerAspect = containerWidth / containerHeight;

    const distanceVert = maxSize / (2 * Math.tan(fov / 2));
    const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * containerAspect);
    const distanceHoriz = maxSize / (2 * Math.tan(horizontalFov / 2));
    const distance = Math.max(distanceVert, distanceHoriz);

    const zoomOutFactor = 1.40;
    camera.position.set(0, 0, distance * zoomOutFactor);
    camera.lookAt(0, 0, 0);

    controls.update();
}

window.addEventListener("resize", () => {
    resizeRenderer();
    fitObjectToView();
});

function animate() {
    requestAnimationFrame(animate);

    if (!isUserInteracting) {
        autoRotateGroup.rotation.y += 0.005;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();