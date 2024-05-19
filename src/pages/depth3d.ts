import * as THREE from "three";

const target = document.querySelector("main")!;

// Create the scene and camera
const scene = new THREE.Scene();

scene.fog = new THREE.Fog(0x000000, 10, 20); // Fog color, near and far distances

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Create the renderer and add it to the DOM
const renderer = new THREE.WebGLRenderer({});
target.appendChild(renderer.domElement);
renderer.domElement.classList.add("💅");

// Set the size of the renderer
function setSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(devicePixelRatio ?? 1);
}
setSize();
window.addEventListener("resize", setSize, false);

// Add a grid helper for the background
const gridHelper = new THREE.GridHelper(100, 50, 0x00aa55, 0x0055aa);
gridHelper.scale.multiplyScalar(0.5);
gridHelper.rotateX(Math.PI / 2);
gridHelper.position.z = -2;
scene.add(gridHelper);

// Add a point light
const pointLight = new THREE.PointLight(0xff00ff, 2, 100); // Increased intensity
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Add a directional light for better illumination
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-5, 10, 5);
scene.add(directionalLight);

// Add an ambient light for better overall illumination
const ambientLight = new THREE.AmbientLight(0xbbaacc); // soft white light
scene.add(ambientLight);

// Set the camera position
camera.position.z = 5;
// camera.position.x = -10;
// camera.position.y = 5;
camera.lookAt(new THREE.Vector3(0, 0, 0));

const worker = new Worker("dist/depth-worker.js");
let workerBusy = false;

let pln;

const video = document.createElement("video");
video.src = "./test-video.mp4";
video.className = "self";
video.width = 300;
video.autoplay = video.loop = video.muted = true;

const videoTexture = new THREE.VideoTexture(video);

const material = new THREE.MeshStandardMaterial({
  map: videoTexture,
  // displacementMap: depthTexture,
  side: THREE.DoubleSide,
});
const geometry = new THREE.PlaneGeometry(5, 5, 200, 200);
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

worker.addEventListener("message", (e) => {
  const result = e.data;

  console.log("result", e.data);

  if (!material.displacementMap) {
    material.displacementMap = new THREE.DataTexture(
      result.texData,
      result.width,
      result.height
    );
    material.displacementMap.needsUpdate = true;
    material.displacementMap.flipY = true;
    material.needsUpdate = true;
  } else {
    material.displacementMap.image.data.set(result.texData);
    material.displacementMap.needsUpdate = true;
  }

  workerBusy = false;
});

await navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    // Set the video source to the webcam stream
    video.srcObject = stream;
  })
  .catch((error) => {
    console.error("Error accessing webcam:", error);
  });

target.appendChild(video);

// Animation loop
function animate(time: number) {
  requestAnimationFrame(animate);

  plane.rotateY(0.002);

  renderer.render(scene, camera);

  if (!workerBusy && video.videoWidth > 0) {
    workerBusy = true;

    createImageBitmap(video).then(
      (bitmap) => {
        worker.postMessage(
          {
            time,
            bitmap,
          },
          [bitmap]
        );
      },
      () => {
        workerBusy = false;
      }
    );
  }
}

animate(performance.now());
