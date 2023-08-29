const video = document.getElementById("video");


//abre a camera com os modelos para identificação e detecção ja prontos integrados na camera
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]).then(startWebcam);

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

//Função de identificação
function getLabeledFaceDescriptions() {
  const labels = ["Matheus", "Messi", "vitoria"];// nome das pastas que identifica as pessoas
  return Promise.all(
    labels.map(async (label) => {//retorna os descritores das pessoas a serem identificadas
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.png`);//acessa cada um dos diretorias em labels
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

function updateOutput(message) {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = message;
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video)//metodo para detectar todos rotos em tempo real
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    //identifica os rostos capturardos com modelos 
    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);//obtem os dados da webcam e compara esses dados com as fotos
    });
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvas);

      if (result.distance < 0.5) {
        const identifiedLabel = result.label;
        console.log(identifiedLabel);
        if (identifiedLabel != "unknown") {
          // Ação a ser executada para rostos identificados com rótulo conhecido
          const accessMessage = identifiedLabel + '\nAcesso liberado';
          updateOutput(accessMessage);
          //console.log("Acesso liberado");
          // Pausa o código por 5 segundos (30000 milissegundos) -simulação de entrar no condominio por exemplo

          function sleep(milliseconds) {
            const start = new Date().getTime();
            while (new Date().getTime() - start < milliseconds) { }
          }
          sleep(5000);
          console.log("Tempo de acesso expirado");

        } else {
          // Ação a ser executada para rostos desconhecidos
          //console.log("Sem permissão de acesso!");
          const deniedMessage = 'Sem permissão de acesso!';
          updateOutput(deniedMessage);
        }
      }
    });
  }, 100);
});
