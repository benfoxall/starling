import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import model from "../models/face_landmarker.task";
import { extractThings } from './util'



const worker = new Worker('dist/track-worker.js')
let workerBusy = false;

let result;


worker.addEventListener('message', (e) => {
  console.log(e.data)

  document.querySelector('output').innerHTML = `
   <pre>${JSON.stringify(e.data.result, null, 2)}</pre>
  `

  result = e.data.full

  workerBusy = false;
})



document.querySelector('main#app').innerHTML = `
  <video src="./test-video.mp4" width="300" autoplay loop muted></video>
  <br />
  <canvas></canvas>
  <br />
  <output style="width: 80%">d</ouput>
`



const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

async function renderLoop(time) {
  if (!workerBusy) {
    const bitmap = await createImageBitmap(video);
    worker.postMessage({
      time,
      bitmap,
      variant: 'full'
    }, [bitmap]);
    workerBusy = true;
  }



  if (result?.faceLandmarks.length) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight;
    canvas.style.width = video.width + 'px'
    canvas.style.background = '#fff2'
    ctx.reset()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(canvas.width, canvas.height)

    ctx.fillStyle = 'red'


    for (const landmark of result.faceLandmarks) {
      ctx.fillStyle = '#f005'
      for (const point of landmark) {
        ctx.fillRect((point.x) + 0, (point.y) + 0, 0.01, 0.01)
      }

      const things = extractThings(landmark);

      ctx.fillStyle = '#08f6'
      ctx.lineWidth = '.01'
      ctx.fillRect(things.cx - .05, things.cy - .05, 0.1, .1)


    }
  }


  // await new Promise(r => setTimeout(r, 100))

  requestAnimationFrame(renderLoop);
}

setTimeout(renderLoop, 100, performance.now())


