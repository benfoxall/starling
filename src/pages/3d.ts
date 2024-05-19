import * as THREE from "three";

const target = document.querySelector("main")!;

// Create the scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Create the renderer and add it to the DOM
const renderer = new THREE.WebGLRenderer();
target.appendChild(renderer.domElement);

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
const gridHelper = new THREE.GridHelper(100, 100, 0xff0088, 0x0088ff);
gridHelper.scale.multiplyScalar(0.5);
gridHelper.rotateX(Math.PI / 2);
gridHelper.position.z = -2;
scene.add(gridHelper);

// Create a more complex shape (e.g., a Torus Knot)
const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
const material = new THREE.MeshStandardMaterial({ color: 0xff0088 });
const complexShape = new THREE.Mesh(geometry, material);
scene.add(complexShape);

// Add a point light
const pointLight = new THREE.PointLight(0xff00ff, 2, 100); // Increased intensity
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Add a directional light for better illumination
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-5, 10, 5);
scene.add(directionalLight);

// Add a point light helper
const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
scene.add(pointLightHelper);

// Add an ambient light for better overall illumination
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

// Set the camera position
camera.position.z = 5;
// camera.position.x = -10;
// camera.position.y = 5;
camera.lookAt(new THREE.Vector3(0, 0, 0));

const worker = new Worker("dist/track-worker.js");
let workerBusy = false;

worker.addEventListener("message", (e) => {
  //   console.log(e.data);

  const result = e.data.result;

  try {
    camera.position.x = -(result.cx - 0.5) * 4;
    camera.position.y = -(result.cy - 0.5) * 4;
    camera.position.z = 5 + result.distance * 0.1;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  } catch (e) {}
  workerBusy = false;
});

const video = document.createElement("video");
video.src = "./test-video.mp4";
video.className = "self";
video.width = 300;
video.autoplay = video.loop = video.muted = true;

navigator.mediaDevices
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
  //   complexShape.rotation.x += 0.01;
  //   complexShape.rotation.y += 0.01;
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
