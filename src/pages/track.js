import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import model from "../models/face_landmarker.task";


document.querySelector('main#app').innerHTML = `
  <video src="./test-video.mp4" width="300" autoplay loop muted></video>
  <br />
  <canvas></canvas>
  <br />
  <output>d</ouput>
`

const vision = await FilesetResolver.forVisionTasks("./wasm");


const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "dist/" + model,
  },
  runningMode: "VIDEO",
  numFaces: 1
});


const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

async function renderLoop(time) {

  const faceLandmarkerResult = faceLandmarker.detectForVideo(video, time);

  if (faceLandmarkerResult.faceLandmarks.length) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight;
    canvas.style.width = video.width + 'px'
    canvas.style.background = '#fff2'
    ctx.reset()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(canvas.width, canvas.height)

    ctx.fillStyle = 'red'


    for (const landmark of faceLandmarkerResult.faceLandmarks) {
      ctx.fillStyle = '#f005'
      for (const point of landmark) {
        ctx.fillRect((point.x) + 0, (point.y) + 0, 0.01, 0.01)
      }


      ctx.strokeStyle = 'green'
      ctx.lineWidth = '.01'
      ctx.beginPath()
      for (const { start, end } of FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS) {
        const startp = landmark[start]
        const endp = landmark[end]

        ctx.moveTo(startp.x, startp.y)
        ctx.lineTo(endp.x, endp.y)
      }

      const left = new Bounds(landmark, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS)
      const right = new Bounds(landmark, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS)
      const mid = new Bounds()
      mid.extend(left.min)
      mid.extend(left.max)
      mid.extend(right.min)
      mid.extend(right.max)

      // I care about a) midpoint, b) distance

      const eyebounds = new Bounds();

      for (const { start, end } of FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS) {
        const startp = landmark[start]
        const endp = landmark[end]

        eyebounds.extend(startp);
        eyebounds.extend(endp);

        ctx.moveTo(startp.x, startp.y)
        ctx.lineTo(endp.x, endp.y)
      }

      document.querySelector('output').innerHTML = `
      ${right.min.x - right.max.x}<br />
      ${right.center.x}, ${right.center.y}<br />

      ${right.size.width}, ${right.size.height}<br />
      `

      ctx.fillStyle = '#00f5'
      ctx.fillRect(mid.min.x, mid.min.y, mid.max.x - mid.min.x, mid.max.y - mid.min.y)
      ctx.fillRect(mid.center.x, mid.center.y, 10, 10)

      ctx.stroke()
    }
  }


  await new Promise(r => setTimeout(r, 100))

  requestAnimationFrame(renderLoop);
}

setTimeout(renderLoop, 100, performance.now())



class Bounds {
  min; max;

  constructor(landmark, list) {
    if (landmark && list) {
      for (const { start, end } of list) {
        this.extend(landmark[start])
        this.extend(landmark[end])
      }
    }
  }

  extend({ x, y }) {
    this.min = {
      x: Math.min(x, this.min?.x ?? Infinity),
      y: Math.min(y, this.min?.y ?? Infinity)
    }
    this.max = {
      x: Math.max(x, this.max?.x ?? -Infinity),
      y: Math.max(y, this.max?.y ?? -Infinity)
    }
  }

  get center() {
    const x = this.min.x + (this.max.x - this.min.x) / 2
    const y = this.min.y + (this.max.y - this.min.y) / 2

    return { x, y }
  }

  get size() {
    const width = (this.max.x - this.min.x)
    const height = (this.max.y - this.min.y)

    return { width, height }
  }
}
