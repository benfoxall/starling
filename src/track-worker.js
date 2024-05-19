import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import model from "./models/face_landmarker.task";
import { extractThings } from './pages/util'

/** @type {FaceLandmarker} */
let faceLandmarker;

const init = (async () => {
    const vision = await FilesetResolver.forVisionTasks("../wasm");

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: model,
        },
        runningMode: "VIDEO",
        numFaces: 1
    });

    console.log("initiated detector worker")
})()


self.addEventListener('message', async (event) => {
    // event.data contains the data sent from the main thread
    const data = event.data;

    await init

    const result = faceLandmarker.detectForVideo(data.bitmap, data.time);

    // will be at most 1
    for (const landmark of result.faceLandmarks) {

        const message = {
            result: extractThings(landmark)
        }

        if (data.variant === 'full') {
            message.full = result;
        }

        // send back things
        self.postMessage(message)

        return;

    }

    self.postMessage({ notFound: true })


});


