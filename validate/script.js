// Iniciar base de dados

firebase.initializeApp({
    apiKey: "AIzaSyAdf3AguODka_zAeePsWj68qrErbzxGz3E",
    authDomain: "brandfeels-cf508.firebaseapp.com",
    projectId: "brandfeels-cf508",
});

// Variables
const db = firebase.firestore();
var roletaGame = db.collection("roleta");
let phoneNumber = "";
let value = "";
const btn = document.getElementById("validate-btn");

btn.addEventListener("click", validate);

async function validate() {
    // Validate values and update database

    // Disable button
    btn.disabled = true;

    document.querySelector(".container button").style.color = "black";
    document.querySelector(".container button").style.backgroundColor = "transparent";

    await roletaGame.doc("players").collection("playersPhones").doc(phoneNumber).get().then((ind) => {
        if (ind.data() == undefined) {
            document.querySelector(".container button").innerHTML = "Jogador não foi encontrado.";
            document.body.style.backgroundColor = "#ff3f3e";
            return ;
        }
        let plays = ind.data().plays;
        for (play in plays) {
            if (plays[play][0] === value && plays[play][1]) {
                plays[play][1] = false;
                roletaGame.doc("players").collection("playersPhones").doc(phoneNumber).update({
                    plays: plays,
                });
                document.querySelector(".container button").innerHTML = "Confirmado!";
                setTimeout(() => {window.location.reload()}, 5000);
                return ;
            }
        }
        document.querySelector(".container button").innerHTML = "Prémio já foi reclamado.";
        document.body.style.backgroundColor = "#ff3f3e";
        setTimeout(() => {window.location.reload()}, 5000);
    });
}

function getValues() {
    let params = new URLSearchParams(window.location.search);
    phoneNumber = params.get('phone');
    value = params.get('value');
    if (!phoneNumber || !value || phoneNumber === "" || value === "") {
        document.querySelector(".container button").style.color = "black";
        document.querySelector(".container button").style.backgroundColor = "transparent";
        document.querySelector(".container button").innerHTML = "Inválido.";
        document.body.style.backgroundColor = "#ff3f3e";
        btn.disabled = true;
        return ;
    }
    document.querySelector(".container h2").innerHTML = value;
}

window.onload = getValues();