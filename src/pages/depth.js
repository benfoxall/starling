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


console.time("depth")

const depthMap2 = await estimator.estimateDepth(image, estimationConfig);
console.log(depthMap)

console.timeEnd("depth")



