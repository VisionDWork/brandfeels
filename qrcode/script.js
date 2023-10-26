document.addEventListener('DOMContentLoaded', function() {
    let params = new URLSearchParams(window.location.search);
    let phone = params.get('phone');
    let value = params.get('value');
    if (!phone || phone === "") {
      return ;
    }
    var qrcode = new QRCode(
      document.getElementById("qrcode"), 
      {
        text: "https://play.brandfeels.com/validate/index.html?phone="+phone+"&value="+value,
        colorDark : "#8c52ff",
        colorLight : "#ffffff",
      }
    );
    document.getElementById("qrcode-container").querySelector('h2').style.display = "none";
});
