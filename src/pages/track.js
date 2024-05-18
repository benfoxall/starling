import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import model from "../models/face_landmarker.task";

console.log("___", FilesetResolver.forVisionTasks, model);


document.querySelector('main#app').innerHTML = `
  <video src="./test-video.mp4" width="200" autoplay loop muted></video>
  <canvas height="300" width="300"></canvas>
`

const vision = await FilesetResolver.forVisionTasks("./wasm");


const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "dist/" + model,
  },
  runningMode: "VIDEO",
});


const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


async function renderLoop(time = 10) {

  // if (video.currentTime !== lastVideoTime) {
  console.log(time)
  const faceLandmarkerResult = faceLandmarker.detectForVideo(video, time);
  //   processResults(detections);

  ctx.clearRect(0, 0, 300, 300)
  ctx.fillStyle = 'red'
  for (const landmark of faceLandmarkerResult.faceLandmarks) {
    for (const point of landmark) {

      ctx.fillRect((point.x * 300) + 0, (point.y * 300) + 0, 2, 2)

    }

  }
  console.log("_____", faceLandmarkerResult);
  //   lastVideoTime = video.currentTime;
  // }

  // await new Promise(r => setTimeout(r, 1000))

  requestAnimationFrame(renderLoop);
}

setTimeout(renderLoop, 100)

// const Track = () => {
//   // const videoRef = useRef()
//   function renderLoop() {
//     const video = document.querySelector("video");

//     // if (video.currentTime !== lastVideoTime) {
//     const faceLandmarkerResult = faceLandmarker.detect(video);
//     //   processResults(detections);
//     console.log("_____", faceLandmarkerResult);
//     //   lastVideoTime = video.currentTime;
//     // }

//     // requestAnimationFrame(() => {
//     //   renderLoop();
//     // });
//   }

//   return (
//     <>
//       <h2>Tracking page</h2>
//       <video
//         autoPlay
//         src="test-video.mp4"
//         loop
//         onClick={renderLoop}
//         width={100}
//       />
//     </>
//   );
// };

// export default Track;
