// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAdf3AguODka_zAeePsWj68qrErbzxGz3E",
  authDomain: "brandfeels-cf508.firebaseapp.com",
  projectId: "brandfeels-cf508",
});

const db = firebase.firestore();
var roletaGame = db.collection("roleta");
let nextGameDate = "";

const getTimeRemaining = (endTime) => {
  const now = new Date().getTime();
  const distance = endTime - now;
  return Math.floor(distance / (1000 * 60 * 60 * 24)); 
};

function displayModal(title, message) {
  return new Promise((resolve, reject) => {
      modal.querySelector('#modal-title').textContent = title;
      modal.querySelector('#modal-text').textContent = message;
      confirmBtn.onclick = function() {
          modal.style.display = "none";
          if (played && winnerSlices.includes(`s${selectedSliceIndex}`)) {
              window.location.href = "https://play.brandfeels.com/qrcode/index.html?phone=" + sanitizedNumber + "&value=" + prizeName;
          } else if (title !== 'Aviso') {
              redirect();
          }
          resolve(false);
      };

      modal.style.display = "block";
  });
}

function generateGrid(daysLeft) {
  const agendaContainer = document.getElementById("agenda-container");

  for (let i = 0; i < daysLeft + 2; i++) {
    const dayDiv = document.createElement("div");
    const date = new Date();
    const today = new Date();
    date.setDate(date.getDate() + i);
    dayDiv.textContent = date.getDate();
    dayDiv.addEventListener('click', () => {
      if (date.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
        window.location.href = 'https://play.brandfeels.com';
      } else {
        displayModal('Aviso', 'Volta neste dia para tentares a tua sorte!');
      }
    });
    agendaContainer.appendChild(dayDiv);
  }
}


async function getTimeAndCreateGrid() {
  let eventName = "NEXT EVENT";
  await roletaGame.doc("stats").get().then((doc) => {
    nextGameDate = doc.data().nextGameDate;
    eventName = doc.data().eventName;
  });

  const countDownDate = new Date(nextGameDate).getTime();
  const daysLeft = getTimeRemaining(countDownDate);
  document.querySelector('#count-message').querySelector('span').textContent = daysLeft + 2;
  document.querySelector('#event-name').textContent = eventName;
  generateGrid(daysLeft);
}

getTimeAndCreateGrid();
