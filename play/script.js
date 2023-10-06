let currentRotation = 0;
let isSpinning = false;

const btn = document.getElementById("btn");

btn.addEventListener('click', rotateRoulette);

function isValidPhoneNumber(number) {
    const validPrefixes = ['96', '93', '91', '92'];
    const prefix = number.substring(0, 2);
    return validPrefixes.includes(prefix) && number.length === 9;
}


function rotateRoulette() {
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

