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
            document.querySelector(".container button").innerHTML = "Jogador não foi encontrado";
            document.body.style.backgroundColor = "#ff3f3e";
            return ;
        }
        let plays = ind.data().plays;
        for (play in plays) {
            if (plays[play][0] === value && plays[play][1] === false) {
                plays[play][1] = true;
                roletaGame.doc("players").collection("playersPhones").doc(phoneNumber).update({
                    plays: plays,
                });
                document.querySelector(".container button").innerHTML = "Confirmado";
                setTimeout(() => {window.location.href = "https://brandfeels.com"}, 3000); 
                return ;
            }
        }
        document.querySelector(".container button").innerHTML = "Já foi usado";
        document.body.style.backgroundColor = "#ff3f3e";
        setTimeout(() => {window.location.href = "https://brandfeels.com"}, 3000); 
    });
}

async function getValues() {
    let paramsObj = {};
    // URL de Teste:
    let url = window.location.href;
    let parsedUrl = new URL(url);
    for (let [key, value] of parsedUrl.searchParams.entries()) {
        paramsObj[key] = value;
    }
    phoneNumber = paramsObj.number;
    value = paramsObj.vale;
    document.querySelector(".container h2").innerHTML = value;
}

window.onload = getValues();