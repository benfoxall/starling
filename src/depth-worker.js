import '@tensorflow/tfjs';
import * as depth from '@tensorflow-models/depth-estimation';


/** @type {import('@tensorflow-models/depth-estimation').DepthEstimator} */
let estimator;

console.time('depth worker init')

const init = (async () => {
    const model = depth.SupportedModels.ARPortraitDepth;
    estimator = await depth.createEstimator(model);


    console.timeEnd('depth worker init')
})()


const estimationConfig = {
    minDepth: 0,
    maxDepth: 1,
}


self.addEventListener('message', async (event) => {
    const data = event.data;

    await init

    const depthMap = await estimator.estimateDepth(data.bitmap, estimationConfig);

    const array = await depthMap.toArray()
    const width = array[0].length
    const height = array.length;
    const texData = new Uint8Array(width * height * 4)

    let index = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            let value = array[y][x];

            if (value < .3) {
                value = .3
            }

            texData[index] = value * 255;
            index++;
            texData[index] = value * 255;
            index++;
            texData[index] = value * 255;
            index++;
            texData[index] = 255;
            index++;
        }
    }


    self.postMessage({
        width, height, texData
    }, [texData.buffer])
});


