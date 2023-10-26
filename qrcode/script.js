document.addEventListener('DOMContentLoaded', function() {
    let params = new URLSearchParams(window.location.search);
    let phone = params.get('phone');
    let value = params.get('value');
    var qrcode = new QRCode(
      document.getElementById("qrcode"), 
      {
        text: "https://play.brandfeels.com/validate/index.html?phone="+phone+"&value="+value,
        colorDark : "#8c52ff",
        colorLight : "#ffffff",
      }
    );
});
