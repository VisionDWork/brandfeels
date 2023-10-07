firebase.initializeApp({
    apiKey: "AIzaSyAdf3AguODka_zAeePsWj68qrErbzxGz3E",
    authDomain: "brandfeels-cf508.firebaseapp.com",
    projectId: "brandfeels-cf508",
});

const db = firebase.firestore();
var game = db.collection("game");
var brand = db.collection("brands");
var player = db.collection("player");
var slices = db.collection("slices");
let currentRotation = 0;
let isSpinning = false;
let redirectLink = "";
let selectedSlice = "";
let challenge = false;
let winMessage = "";

const btn = document.getElementById("btn");

btn.addEventListener('click', rotateRoulette);

function isValidPhoneNumber(number) {
    const validPrefixes = ['96', '93', '91', '92'];
    const prefix = number.substring(0, 2);
    return validPrefixes.includes(prefix) && number.length === 9;
}


async function rotateRoulette() {
    if (isSpinning) return;

    let angle = getAngleToRotate(selectedSlice);
    currentRotation += angle;
    let prizeName = getPrizeMessage(selectedSlice);

    if (!challenge) {
        let phone = document.querySelector('#telefone').value;
        let sanitizedNumber = phone.replace(/\s+/g, '');
        if (sanitizedNumber.startsWith('+351')) {
            sanitizedNumber = sanitizedNumber.substring(4);
        }

        if (!isValidPhoneNumber(sanitizedNumber)) {
            alert("Invalid phone number!");
            return ;
        }
        let flag_tentativas = false;
        let flag_gameTime = false;
        await game.doc("gameTime").get().then((doc) => {
            flag_gameTime = doc.data().isOn;
        });
        if(!flag_gameTime){
            alert("Espera pelo próximo \"SCAN TIME\"");
            location.reload();
            return;
        }
        await player.doc(sanitizedNumber).get().then((doc) => {
            const agora = Math.floor(Date.now()/1000);
            if(doc.exists){
                let p = doc.data().plays;
                if ((agora - doc.data().time) < 900){
                    flag_tentativas = true;
                    alert("Já jogaste esta vez, espera pelo próximo \"SCAN TIME\"")
                    return;
                }
                if(doc.data().plays < 4){
                    switch(p){
                    case 1: {
                        player.doc(sanitizedNumber).update({
                            plays: p + 1,
                            time: agora,
                            play2: prizeName,
                        })
                    }break;
                    case 2: {
                        player.doc(sanitizedNumber).update({
                            plays: p + 1,
                            time: agora,
                            play3: prizeName,
                        })
                    }break;
                    case 3: {
                        player.doc(sanitizedNumber).update({
                            plays: p + 1,
                            time: agora,
                            play4: prizeName,
                        })
                    }break;
                    default: {}
                    }
                }else{
                    flag_tentativas = true;
                    alert("Já fizeste 4 tentativas");
                    return;
                }
            }else{
                // Save phone number
                player.doc(sanitizedNumber).set({
                    plays: 1,
                    time: agora,
                    play1: prizeName,
                })
            }
            }
        )
        if(flag_tentativas){
            if (redirectLink === "") {
                location.reload();
            } else {
                location.replace(redirectLink);
            }
            return;
        }

        btn.disabled = true; // Disable the button
    }

    let roleta = document.querySelector('.roulette-container');
    roleta.style.transition = 'transform 3000ms ease';
    roleta.style.transform = `rotate(${currentRotation}deg)`;
    setTimeout(() => {
        if (!challenge && prizeName !== "Upsss...") {
            alert("Ganhaste: " + prizeName + "\n\n" + winMessage)
        } else {
            alert(prizeName);
        }
        if (redirectLink === "" || challenge) {
            location.reload();
        } else {
            location.replace(redirectLink);
        }
    }, 3100);


}

function getPrizeMessage(slice) {
    const sliceElement = document.querySelector(`#slice-${slice} span`);
    if (sliceElement) {
        return sliceElement.textContent;
    } else {
        return 'Unknown prize';
    }
}

function getAngleToRotate(slice) {
    const spins = 4 ; 
    const fullRotation = 360;
    let baseAngle;

    switch(slice) {
        case 1: baseAngle = 60; break;
        case 2: baseAngle = 30; break;
        case 3: baseAngle = 0; break;
        case 4: baseAngle = 330; break;
        case 5: baseAngle = 300; break;
        case 6: baseAngle = 270; break;
        case 7: baseAngle = 240; break;
        case 8: baseAngle = 210; break;
        case 9: baseAngle = 180; break;
        case 10: baseAngle = 150; break;
        case 11: baseAngle = 120; break;
        case 12: baseAngle = 90; break;
        default: baseAngle = 0;
    }

    return spins * fullRotation + baseAngle;
}

function getRandomAngle(min, max) {
    return Math.random() * (max - min) + min;
}


async function prepareGame() {

    // Prepare pizza

    let index = "bebida";
    await slices.doc("slice_index").get().then((ind) => {
        index = ind.data().index;
    });

    await slices.doc(index.toString()).get().then((doc) => {
        let slice = doc.data();
        winMessage = doc.data().winMessage;
        document.getElementById("slice-1").innerHTML="<span>"+slice.r2+"</span>"
        document.getElementById("slice-2").innerHTML="<span>"+slice.r3+"</span>"
        document.getElementById("slice-3").innerHTML="<span>"+slice.r1+"</span>"
        document.getElementById("slice-4").innerHTML="<span>"+slice.r3+"</span>"
        document.getElementById("slice-5").innerHTML="<span>"+slice.r2+"</span>"
        document.getElementById("slice-6").innerHTML="<span>"+slice.r3+"</span>"
        document.getElementById("slice-7").innerHTML="<span>"+slice.r2+"</span>"
        document.getElementById("slice-8").innerHTML="<span>"+slice.r3+"</span>"
        document.getElementById("slice-9").innerHTML="<span>"+slice.r2+"</span>"
        document.getElementById("slice-10").innerHTML="<span>"+slice.r3+" </span>"
        document.getElementById("slice-11").innerHTML="<span>"+slice.r2+"</span>"
        document.getElementById("slice-12").innerHTML="<span>"+slice.r3+"</span>"
    })

    // Prepare Brand Logo and redirect link

    let brandName = "brandfeels";
    await brand.doc("brand").get().then((ind) => {
        brandName = ind.data().name;
    });

    await brand.doc(brandName).get().then((doc) => {
        let data = doc.data();
        // Update brand logo
        document.getElementById("logo").src = "./content/logos/" + data.logo;
        redirectLink = data.link;
    });

    // Prepare winner slice
    
    let random = Math.floor(Math.random() * 100) + 1;
    // Get reward based on probability in database
    
    index = "bebida";
    await slices.doc("slice_index").get().then((ind) => {
        index = ind.data().index;
        challenge = ind.data().challenges;
    });
    
    // Check if it is challenge to change title
    if (challenge) {
        document.querySelector('#title1').innerHTML = "Spin for";
        document.querySelector('#title2').innerHTML = "a challenge";
        document.querySelector('.input-section').style.display = "none";
        document.querySelector('.premio-section').style.display = "none";
        document.querySelector('#btn').style.marginTop = "3rem";
    } 

    await slices.doc(index.toString()).get().then((doc) => {
        let slice = doc.data();
        if (random <= slice.r1Prob) {
            selectedSlice =  3; // 3 - maior premio
        } else if (random <= slice.r1Prob + slice.r2Prob) {
            let randomSlice = Math.floor((Math.random() * 5) + 1);
            switch(randomSlice) {
                case 1: selectedSlice = 1; break;
                case 2: selectedSlice = 5; break;
                case 3: selectedSlice = 7; break;
                case 4: selectedSlice = 9; break;
                case 5: selectedSlice = 11; break;
                default: selectedSlice = 1;
            }
        } else {
            let randomSlice = Math.floor((Math.random() * 6) + 1);
            switch(randomSlice) {
                case 1: selectedSlice = 2; break;
                case 2: selectedSlice = 4; break;
                case 3: selectedSlice = 6; break;
                case 4: selectedSlice = 8; break;
                case 5: selectedSlice = 10; break;
                case 6: selectedSlice = 12; break;
                default: selectedSlice = 2;
            }
        }
    })
    
    btn.disabled = false;
}

window.onload = prepareGame;
