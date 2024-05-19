// import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs';
import * as depth from '@tensorflow-models/depth-estimation';

const target = document.querySelector('main')


const image = new Image();
const done = new Promise(r => image.onload = r);
image.src = 'test-image.jpg'
image.width = 400
target.appendChild(image)

await done

let video;

image.addEventListener('click', function () {

    // Create a video element
    video = document.createElement("video");
    video.autoplay = true;
    video.width = 400;

    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {

            video.srcObject = stream;

            image.replaceWith(video)
        })
        .catch((error) => {
            console.error("Error accessing webcam:", error);
        });
}, { once: true });

const model = depth.SupportedModels.ARPortraitDepth;

const estimator = await depth.createEstimator(model);

const estimationConfig = {
    minDepth: 0,
    maxDepth: 1,
}

const depthMap = await estimator.estimateDepth(image, estimationConfig);
console.log(depthMap)

const im = await depthMap.toCanvasImageSource()

const canvas = document.createElement('canvas')
target.appendChild(canvas)
canvas.width = image.width
canvas.height = image.height
canvas.getContext('2d').drawImage(im, 0, 0);


async function loop() {
    if (video?.videoWidth > 10) {

        console.time("depth")

        const depthMap = await estimator.estimateDepth(video, estimationConfig);
        console.log(depthMap)
        const im = await depthMap.toCanvasImageSource()

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.style.width = video.width + 'px'
        canvas.getContext('2d').drawImage(im, 0, 0);
        console.timeEnd("depth")

        requestAnimationFrame(loop)
        return;

    }
    setTimeout(loop, 100)
}

loop()



