console.log("SOME MANUAL THING");
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import model from "../models/face_landmarker.task";
import { useRef } from "react";

console.log("___", FilesetResolver.forVisionTasks, model);

const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  //   "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  "./wasm"
);

const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "dist/" + model,
  },
  runningMode: "IMAGE",
});

const Track = () => {
  // const videoRef = useRef()
  function renderLoop() {
    const video = document.querySelector("video");

    // if (video.currentTime !== lastVideoTime) {
    const faceLandmarkerResult = faceLandmarker.detect(video);
    //   processResults(detections);
    console.log("_____", faceLandmarkerResult);
    //   lastVideoTime = video.currentTime;
    // }

    // requestAnimationFrame(() => {
    //   renderLoop();
    // });
  }

  return (
    <>
      <h2>Tracking page</h2>
      <video
        autoPlay
        src="test-video.mp4"
        loop
        onClick={renderLoop}
        width={100}
      />
    </>
  );
};

export default Track;
