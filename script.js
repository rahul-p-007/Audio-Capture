let mediaRecorder;
let chunks = [];
let audioContext;
let analyser;
let canvas;
let canvasCtx;

const recordButton = document.getElementById("recordButton");
const stopButton = document.getElementById("stopButton");
const visualizer = document.getElementById("visualizer");
const pauseButton = document.getElementById("pause");
const playButton = document.getElementById("play");
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia supported.");

  const constraints = { audio: true };

  const startRecording = (stream) => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audio = document.createElement("audio");
      audio.controls = true;

      const blob = new Blob(chunks, { type: "audio/webm" });
      chunks = [];
      const audioURL = URL.createObjectURL(blob);
      audio.src = audioURL;

      document.body.appendChild(audio);
    };

    recordButton.onclick = () => {
      mediaRecorder.start();
      recordButton.disabled = true;
      stopButton.disabled = false;
      recordButton.classList.add("recording");
      pauseButton.style.display = "block";
      playButton.style.display = "none";
    };

    stopButton.onclick = () => {
      mediaRecorder.stop();
      recordButton.disabled = false;
      stopButton.disabled = true;
      recordButton.classList.remove("recording");
      pauseButton.style.display = "none";
      playButton.style.display = "block";
    };

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    canvas = visualizer;
    canvasCtx = canvas.getContext("2d");

    const drawVisualizer = () => {
      requestAnimationFrame(drawVisualizer);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = "rgb(0, 0, 0)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        canvasCtx.fillStyle = `rgb(${barHeight + 153}, 0, 0)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    drawVisualizer();
  };

  const handleError = (error) => {
    console.log("navigator.getUserMedia error: ", error);
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(startRecording)
    .catch(handleError);
} else {
  console.log("getUserMedia not supported.");
}
