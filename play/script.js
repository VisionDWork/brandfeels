// Iniciar base de dados

firebase.initializeApp({
    apiKey: "AIzaSyAdf3AguODka_zAeePsWj68qrErbzxGz3E",
    authDomain: "brandfeels-cf508.firebaseapp.com",
    projectId: "brandfeels-cf508",
});

// Variables
const db = firebase.firestore();
var roletaGame = db.collection("roleta");
var roletaElement = document.querySelector('.roulette-container');
var tc = document.querySelector('#tc');
// Verifica se o jogo esta a decorrer
let isSpinning = false;
let flag_tentativas = false;
// Verifica se o jogo esta é de desafios ou premios
// true: premios
// false: desafios
let flag_gameOn = false;
let played = false;
// Indica a rotacao da roleta
let currentRotation = 0;
// Qual e o premio
let specialSlice = 1;
// Slice que calhou
let slice_selected = 1;
let selectedSliceIndex = 1;
// Angulo do slice que calhou
let angle = 0;
// Mensagem de resultado do premio
let winMessage = "";
let winnerSlices = [];
// Link de redirecionamento apos rodar
let redirectLink = "";
// Marca escolhida a ser apresentada
let brand_selected = "brandfeels";
// Tipo de roleta selecionada
let roleta_selected = "bebida";
let slices;
// Numero de tipos diferentes de resultados
let slicesLen;
// Numero total de fatias
let totalSlices = 0;
let prizeName = "";
// Number of tries allowed per scan time
let tries = 1;
let minutesOfScanTime = 15;
// Sanitized Number
let sanitizedNumber = "";
let links = {

}

async function prepareGame() {

    // Get game stats
    await roletaGame.doc("stats").get().then((doc) => {
        flag_gameOn = doc.data().isOn;
        tries = doc.data().triesPerScanTime;
        minutesOfScanTime = doc.data().minutesOfScanTime;
        brand_selected = doc.data().brandSelected;
        roleta_selected = doc.data().sliceSelected;
    });

    // Get info for slices
    await roletaGame.doc("slices").collection(roleta_selected).doc("info").get().then((ind) => {
        winMessage = ind.data().message;
        if (ind.data().winnerSlices) {
            winnerSlices = ind.data().winnerSlices;
        }
        specialSlice = ind.data().specialSlice;
    });

    // Get slices
    await roletaGame.doc("slices").collection(roleta_selected).doc("slices").get().then((ind) => {
        slices = ind.data();
        slicesLen = Object.keys(slices).length;
    });

    // Create slices list with slice elements
    let slicesList = [];
    for (let i = 0; i != slicesLen; i++) {
        let maxSlices = slices[`s${i+1}`][2];
        totalSlices += maxSlices;
        for (let j = 0; j != maxSlices; j++) {
            let newSlice = document.createElement("div");
            newSlice.id = "slice-" + (i + 1).toString();
            newSlice.innerHTML = `<span>${slices[`s${i+1}`][0]}</span>`;
            slicesList.push(newSlice);
            if (`s${i+1}` === specialSlice) {
                newSlice.className = "pizza-slice premio";
            } else {
                newSlice.className = "pizza-slice";
            }
        }
    }

    function shuffleSlices(slicesList) {
        let shuffledList = [];
        let tempList = [...slicesList];
        
        let lastSliceType = null; 
    
        while (tempList.length > 0) {
            // Get slices that are not of the same type as the last added slice
            let availableSlices = tempList.filter(slice => !lastSliceType || slice.id !== lastSliceType);
            
            if (availableSlices.length === 0) {
                // This means there are no different slice types available
                availableSlices = tempList;
            }
    
            // Randomly select a slice
            let randomIndex = Math.floor(Math.random() * availableSlices.length);
            let selectedSlice = availableSlices[randomIndex];
    
            // Add it to the shuffledList
            shuffledList.push(selectedSlice);
    
            // Remove the selected slice from tempList
            tempList = tempList.filter(slice => slice !== selectedSlice);
    
            // Update the lastSliceType
            lastSliceType = selectedSlice.id;
        }
        
        return shuffledList;
    }

    // Add slices to the roulette
    angle = 360 / totalSlices; // Initial angle for each slice
    let initAngle = 0;
    let shuffledList = shuffleSlices(slicesList);
    for (ele in shuffledList) {
        shuffledList[ele].style = `--rotate: ${initAngle}deg;`;
        initAngle += angle;
        roletaElement.appendChild(shuffledList[ele]);
    }

    // Prepare Brand Logo and redirect link
    await roletaGame.doc("brands").collection(brand_selected).doc(brand_selected).get().then((doc) => {
        document.getElementById("logo").src = "./content/logos/" + doc.data().logo;
        document.getElementById('brand-link').href = doc.data().link;
    });
    
    // Check if it is challenge to change title
    if (!flag_gameOn) {
        // document.querySelector('#title1').innerHTML = "Spin for";
        // document.querySelector('#title2').innerHTML = "a challenge";
        document.querySelector('.tc-section').style.display = "none";
        document.querySelector('.input-section').style.display = "none";
        document.querySelector('.premio-section').style.display = "none";
        document.querySelector('#btn').style.marginTop = "3rem";
    }

    function getAccumulatedProbabilities(slices) {
        let accumulatedProbabilities = [];
        let total = 0;
        for (let i = 0; i != slicesLen; i++) {
            total += slices[`s${i+1}`][1];  // slices[i][1] is the probability percentage
            accumulatedProbabilities.push(total);
            links[slices[`s${i+1}`][0]] = slices[`s${i+1}`][3];
        }
        return accumulatedProbabilities;
    }
    
    function getRandomSliceBasedOnProbability(slices) {
        let accumulatedProbabilities = getAccumulatedProbabilities(slices);
        let random = Math.random() * 100;  // get a random number between 0 and 100
    
        for (let i = 0; i < accumulatedProbabilities.length; i++) {
            if (random <= accumulatedProbabilities[i]) {
                return i + 1;  // return the index of the selected slice
            }
        }
        return -1;  // should never happen if the probabilities sum up to 100
    }
    
    // Using the above functions inside your prepareGame function:
    selectedSliceIndex = getRandomSliceBasedOnProbability(slices);
    // Escolher dos varios slices com o mesmo premio um aleatorio
    let selectedIndex = Math.floor(Math.random() * slices[`s${selectedSliceIndex}`][2]);
    // Buscar o index na lista de slices
    for (let i = 0; i != selectedSliceIndex - 1; i++) {
        selectedIndex += slices[`s${i+1}`][2];
    }
    slice_selected = slicesList[selectedIndex];

    btn.disabled = false;
}


// When button is clicked it goes into this function
async function rotateRoulette() {
    if (isSpinning) return;
    isSpinning = true;

    prizeName = getPrizeMessage(slice_selected);

    if (flag_gameOn) {
        let phone = document.querySelector('#telefone').value;
        sanitizedNumber = phone.replace(/\s+/g, '');
        if (sanitizedNumber.startsWith('+351')) {
            sanitizedNumber = sanitizedNumber.substring(4);
        }

        if (!isValidPhoneNumber(sanitizedNumber)) {
            displayModal("Aviso", "Número inválido!");
            isSpinning = false;
            return ;
        }

        if (!tcAccepted()) {
            displayModal("Aviso", "Aceita os T&C para jogar!");
            isSpinning = false;
            return ;
        }

        // TODO: 2 factor authentication

        played = true;

        await roletaGame.doc("players").collection("playersPhones").doc(sanitizedNumber).get().then(async (doc) => {
            const agora = Math.floor(Date.now()/1000);
            const date = new Date(agora * 1000);
            const readableDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            if (doc.exists){

                // Se o jogador existir na BD, atualizar os seus dados
                let numberOfTries = doc.data().numberOfTries;
                let numberOfPlays = doc.data().numberOfPlays;
                let plays = doc.data().plays;
                let newPlays = {
                    ...plays,
                    ['play' + (numberOfTries + 1).toString()]: [prizeName, true, readableDate] 
                };
                
                if ((agora - doc.data().firstTimePlayed) >= minutesOfScanTime*60) {
                    // Caso ja possa jogar novamente (passou x minutos deste a primeira vez que jogou)
                    roletaGame.doc("players").collection("playersPhones").doc(sanitizedNumber).update({
                        numberOfTries: 0,
                        firstTimePlayed: agora,
                    })
                    numberOfTries = 0;
                }
                // Caso ja tenha jogado x vezes
                // Calculate the time left
                const currentTime = new Date();
                const lastPlayedTime = new Date(); // Set this to the time when you last played
                const timeDifference = Math.floor((currentTime - lastPlayedTime) / (60 * 1000)); // in minutes
                
                // Calculate the time left to play
                const timeLeftToPlay = minutesOfScanTime - timeDifference;
                if (numberOfTries >= tries){
                    flag_tentativas = true;
                    await displayModal("Aviso", `Espera ${timeLeftToPlay} minutos para jogares novamente!`);
                    isSpinning = false;
                    return ;
                } 
                // Verificar se ganhou premio, pois se nao ganhar nao guardamos resultados
                if (!winnerSlices.includes(`s${selectedSliceIndex}`)) {
                    roletaGame.doc("players").collection("playersPhones").doc(sanitizedNumber).update({
                        numberOfTries: numberOfTries + 1,
                        numberOfPlays: numberOfPlays + 1,
                    })
                } else {
                    roletaGame.doc("players").collection("playersPhones").doc(sanitizedNumber).update({
                        numberOfTries: numberOfTries + 1,
                        numberOfPlays: numberOfPlays + 1,
                        plays: newPlays,
                    })
                }
            } else {
                // Se jogador nao existir na BD, criar novo jogador
                roletaGame.doc("players").collection("playersPhones").doc(sanitizedNumber).set({
                    numberOfTries: 1,
                    numberOfPlays: 1,
                    firstTimePlayed: agora,
                    plays: {play1: [prizeName, true, readableDate]},
                })
            }
        })
        if(flag_tentativas){
            redirect();
            isSpinning = false;
            return;
        }

        btn.disabled = true; // Disable the button
    }

    let angle = getAngleToRotate(slice_selected);
    currentRotation += angle;
    roletaElement.style.transition = 'transform 3000ms ease';
    roletaElement.style.transform = `rotate(${currentRotation}deg)`;
    setTimeout(() => {
        // TODO
        // send message to player
        // Se for jogo de premio e o premio for de vencedor aparece "Parabens!"
        // Caso contrario aparece apenas o "Resultado:"
        if (flag_gameOn && winnerSlices.includes(`s${selectedSliceIndex}`)) {
            displayModal("Parabéns!", "Ganhaste: " + prizeName + ", " + winMessage);
        } else if (!flag_gameOn) {
            displayModal("Resultado:", prizeName + ", " + winMessage);
        } else {
            displayModal("Resultado:", prizeName);
        }
        isSpinning = false;
    }, 3100);
}


// Other functions

// Some elements and its events
const btn = document.getElementById("btn");
btn.addEventListener('click', rotateRoulette);
tc.addEventListener('click', () => { tc.classList.toggle('active'); });
var modal = document.getElementById('modal');
var confirmBtn = document.getElementById('confirmBtn');

function displayModal(title, message) {
    return new Promise((resolve, reject) => {
        modal.querySelector('#modal-title').textContent = title;
        modal.querySelector('#modal-text').textContent = message;
        confirmBtn.onclick = function() {
            modal.style.display = "none";
            if (played && winnerSlices.includes(`s${selectedSliceIndex}`)) {
                if (links[prizeName] === undefined) {
                    window.location.href = "https://play.brandfeels.com/qrcode/index.html?phone=" + sanitizedNumber + "&value=" + prizeName;
                } else {
                    window.location.href = links[prizeName];
                }
            } else if (title !== 'Aviso') {
                redirect();
            }
            resolve(false);
        };

        modal.style.display = "block";
    });
}

function tcAccepted() {
    return tc.classList.contains('active');
}

function isValidPhoneNumber(number) {
    const validPrefixes = ['96', '93', '91', '92'];
    const prefix = number.substring(0, 2);
    return validPrefixes.includes(prefix) && number.length === 9;
}

function redirect() {
    if (redirectLink === "" || !flag_gameOn) {
        location.reload();
    } else {
        // location.replace(redirectLink);
        location.reload();
    }
}


function getPrizeMessage(slice) {
    const sliceElement = document.querySelector(`#slice-${selectedSliceIndex} span`);
    if (sliceElement) {
        return sliceElement.textContent;
    } else {
        return 'Unknown prize';
    }
}

function getAngleToRotate(sliceIndex) {
    const spins = 4; 
    const fullRotation = 360;

    let computedStyle = window.getComputedStyle(sliceIndex);
    let rotationValue = computedStyle.getPropertyValue('--rotate').trim();
    let degreeValue = parseFloat(rotationValue);

    baseAngle = fullRotation - degreeValue;

    return fullRotation * spins + (baseAngle + 60);
}

function getRandomAngle(min, max) {
    return Math.random() * (max - min) + min;
}

// Add to database

/* ========================
async function addToDatabase() {

    
    // Add Roulette 
    
    // Roulette name
    let name = "halloween";
    // Roulette slices
    await roletaGame.doc("slices").collection(name).doc("slices").set({
        s1: ["Travessura", 15, 1],
        s2: ["Upsss...", 45, 6],
        s3: ["Douçura", 40, 5],
        //...
    })
    
    // Roulette info
    await roletaGame.doc("slices").collection(name).doc("info").set({
        specialSlice: "s1",
        message: "Tira screenshot do QR Code que aparecer!",
        winnerSlices: ["s1", "s3"],
    })
    
    
// Add brand 

// brand name
let brand = "festivalDoCaloiro";
await roletaGame.doc("brands").collection(brand).doc(brand).set({
    link: "https://visiond.pt",
    logo: "festivalDoCaloiro.png",
})


}

addToDatabase();

======================== */ 

window.onload = prepareGame;
