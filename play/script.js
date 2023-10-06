firebase.initializeApp({
    apiKey: "AIzaSyAdf3AguODka_zAeePsWj68qrErbzxGz3E",
    authDomain: "brandfeels-cf508.firebaseapp.com",
    projectId: "brandfeels-cf508",
});

const db = firebase.firestore();
var player = db.collection("player");
var game = db.collection("game");
var slices = db.collection("slices");
let currentRotation = 0;
let isSpinning = false;

const btn = document.getElementById("btn");

btn.addEventListener('click', rotateRoulette);

function isValidPhoneNumber(number) {
    const validPrefixes = ['96', '93', '91', '92'];
    const prefix = number.substring(0, 2);
    return validPrefixes.includes(prefix) && number.length === 9;
}


async function rotateRoulette() {
    if (isSpinning) return;

    let phone = document.querySelector('#telefone').value;
    // Sanitize the phone number by removing spaces and checking for the +351 prefix
    let sanitizedNumber = phone.replace(/\s+/g, '');
    if (sanitizedNumber.startsWith('+351')) {
        sanitizedNumber = sanitizedNumber.substring(4);
    }

    if (!isValidPhoneNumber(sanitizedNumber)) {
        alert("Invalid phone number!");
        return ;
    }

    // TODO - Save phone number
    let flag_tentativas = false;
    let flag_gameTime = false;

    await game.doc("gameTime").get().then((doc) => {
        flag_gameTime = doc.data().isOn;
    });

    if(!flag_gameTime){
        alert("Não é possível jogar agora");
        location.reload();
        return;
    }
    await player.doc(sanitizedNumber).get().then((doc) => {
        const agora = Math.floor(Date.now()/1000);
        if(doc.exists){
            console.log(doc.data());
            if ((agora - doc.data().time) < 900){
                flag_tentativas = true;
                alert("Já jogaste esta vez")
                return;
            }
            if(doc.data().plays < 4){
                player.doc(sanitizedNumber).set({
                    plays: doc.data().plays + 1,
                    time: agora,
                })
            }else{
                flag_tentativas = true;
                alert("Já fizeste 4 tentativas");
                return;
            }
        }else{
            player.doc(sanitizedNumber).set({
                plays: 1,
                time: agora,
            })
        }
        }
    )
    if(flag_tentativas){
        location.reload();
        return;
    }


    btn.disabled = true; // Disable the button

    // Randomly pick a slice number (1 to 12)
    let selectedSlice = Math.floor(Math.random() * 12) + 1;
    let angle = getAngleToRotate(selectedSlice);
    currentRotation += angle;

    let roleta = document.querySelector('.roulette-container');
    roleta.style.transition = 'transform 3000ms ease';
    roleta.style.transform = `rotate(${currentRotation}deg)`;
    setTimeout(() => {
        // TODO - Send message
        alert(getPrizeMessage(selectedSlice));
        location.reload();
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


async function preparePizza() {
    let index = 1;
    await slices.doc("slice_index").get().then((ind) => {
        index = ind.data().index;
    });

    await slices.doc(index.toString()).get().then((doc) => {
        let slice = doc.data();
        document.getElementById("slice-1").innerHTML="<span>"+slice.s1+"</span>"
        document.getElementById("slice-2").innerHTML="<span>"+slice.s2+"</span>"
        document.getElementById("slice-3").innerHTML="<span>"+slice.s3+"</span>"
        document.getElementById("slice-4").innerHTML="<span>"+slice.s4+"</span>"
        document.getElementById("slice-5").innerHTML="<span>"+slice.s5+"</span>"
        document.getElementById("slice-6").innerHTML="<span>"+slice.s6+"</span>"
        document.getElementById("slice-7").innerHTML="<span>"+slice.s7+"</span>"
        document.getElementById("slice-8").innerHTML="<span>"+slice.s8+"</span>"
        document.getElementById("slice-9").innerHTML="<span>"+slice.s9+"</span>"
        document.getElementById("slice-10").innerHTML="<span>"+slice.s10+" </span>"
        document.getElementById("slice-11").innerHTML="<span>"+slice.s11+"</span>"
        document.getElementById("slice-12").innerHTML="<span>"+slice.s12+"</span>"
    })
}

window.onload = preparePizza;
