document.addEventListener('DOMContentLoaded', function() {
    let params = new URLSearchParams(window.location.search);
    let phone = params.get('phone');
    let value = params.get('value');
    console.log(phone, value);
    var qrcode = new QRCode(
        document.getElementById("qrcode"), 
        {
          text: "https://thankful-glacier-0ba138310.4.azurestaticapps.net/validate/index.html?phone="+phone+"&value="+value,
          colorDark : "#8c52ff",
          colorLight : "#ffffff",
        }
      );
});
