const BASE = 0.32;
const TRANSIT = 0.38;
const IGIC = 0.07;
const T5BASE = 0.0124;
const T5BASEBIGBOATS = 0.0397;
const T5TRANSIT = 0.0186;
const T5TRANSITBIGBOATS = 0.0484;
const T5DISCOUNT = 0.25;
const T0 = 0.025;
const T0DISCOUNT = 0.2;
let plainText = "";
let text = [];
let sailingVessel = true;
let capitan, email, phone, vessel, arrival, departure, length, beam, stayPrice, nights, tariff, discount, t5, t0 = 0,
    finalPrice, taxes, booking, emailTemplate, englishMail, spanishMail;

$("#get-email").keyup(function(){
    getVariables($("#get-email").val());
    main();
});

$("#get-email").change(function () {
    plainText = $("#get-email").val();
    getVariables(plainText);
    main();
});

//create variables according to the textarea
function getVariables(plainText) {
    text = plainText.split("\n"); // divide  the text in lines
    for (i in text) {
        line = text[i].split(":");
        if (text[i].includes("Nombre:") || text[i].includes("Name:")) {
            capitan = line[1];
        } else if (text[i].includes("Email:")) {
            email = line[1];
        } else if (text[i].includes("Teléfono:") || text[i].includes("N'º:")){
            phone = line[1];
        } else if (text[i].includes("barco:") || text[i].includes("name:")) {
            vessel = line[1];
        } else if (text[i].includes("Fecha entrada:") || text[i].includes("Arrival date:")) {
            arrival = line[1];
        } else if (text[i].includes("Fecha salida") || text[i].includes("Departure date:")) {
            departure = line[1];
        } else if (text[i].includes("Eslora") || text[i].includes("(LOA):")) {
            length = parseFloat(line[1].replace(",", "."));
        } else if (text[i].includes("Manga") || text[i].includes("Beam:")) {
            beam = parseFloat(line[1].replace(",", "."));
        }
    }
    calculateNights(arrival, departure);
}


function calculateNights(arrival, departure) {
    a = new Date(arrival).getTime();
    d = new Date(departure).getTime();
    nights = d - a;
    nights = Math.round(nights / (1000 * 60 * 60 * 24)); // (1000*60*60*24) --> milisegundos -> segundos -> minutos -> horas -> días

}

function calculatePrice() {
    
    stayPrice = length * beam * nights * tariff * (1 - discount);
    getTaxes(); // calcula que tasa corresponde y suma la t5 y la t0
    totalT5 = length * beam * (nights + 1) * t5 * (1 - T5DISCOUNT);
    totalT0 = length * beam * (nights + 1) * t0 * (1 - T0DISCOUNT);
    finalPrice = ((Math.round(stayPrice * 100) / 100 + Math.round(totalT5 * 100) / 100) * (1 + IGIC)) + Math.round(totalT0 * 100) / 100;
    finalPrice = Math.round(finalPrice * 100) / 100;
}

function getTariff() {
    if (nights < 180) {
        tariff = TRANSIT;
    } else {
        tariff = BASE;
    }
}

function printMail() {

    // print all the variables content as HTML

    emailTemplate = 
`Good morning
%0D%0A
%0D%0A
Many thanks for your interest in Marina Lanzarote.
%0D%0A
%0D%0A
Your reservation is confirmed with number: ${booking} This number would have to be provided upon arrival.
%0D%0A
%0D%0A
ETA: ${arrival} 
%0D%0A
%0D%0A
ETD: ${departure} 
%0D%0A
%0D%0A
It'd be super nice if you can fill the forms and send it back to us, that would speed up the check in procedure.
%0D%0A
%0D%0A
The price for ${nights} nigths for ${vessel} would be: ${finalPrice}€ (if you pay upon arrival).
%0D%0A
%0D%0A
Looking forward to welcome you.
%0D%0A
%0D%0A
With kind regards,
%0D%0A
%0D%0A
    `;
    $(".email").html(emailTemplate.replace(/%0D%0A/g, "<br>"));
    createEmailFormat();
}

function printMailEs() {

    // print all the variables content as HTML in spanish

    emailTemplate = 
`Buenos días
%0D%0A
%0D%0A
Muchas gracias por su interés Marina Lanzarote.
%0D%0A
%0D%0A
Su reserva ha sido confirmada, su númer de reserva es: ${booking} Este número podría ser requerido a su llegada.
%0D%0A
%0D%0A
ETA: ${arrival} 
%0D%0A
%0D%0A
ETD: ${departure} 
%0D%0A
%0D%0A
Sería de gran ayuda si pudiera enviar rellenos los formularios ajduntos, eso aceleraría el proceso de check-in a su llegada.
%0D%0A
%0D%0A
El precio para ${nights} noche/s para ${vessel} sería de: ${finalPrice}€ (si paga por adelantado).
%0D%0A
%0D%0A
Esperamos noticias suyas.
%0D%0A
%0D%0A
Un saludo.
%0D%0A
%0D%0A
`;

    $(".email").html(emailTemplate.replace(/%0D%0A/g, "<br>"));
    createEmailFormat();
    
}

function getDiscount() {

    if (tariff === BASE) {
        if (nights >= 365) {
            discount = 0.40;
        } else if (nights >= 180) {
            discount = 0.35;
        } else if (nights >= 90) {
            discount = 0.20;
        } else if (nights >= 30) {
            discount = 0.10;
        } else {
            discount = 0;
        }
    } else {
        if (nights >= 90) {
            discount = 0.30;
        } else if (nights >= 30) {
            discount = 0.20;
        } else if (nights >= 15) {
            discount = 0.10;
        } else {
            discount = 0;
        }

    }

}

function getTaxes() {
    //   VELERO          MAYOR DE 12M  O   MOTOR           MAYOR DE 9M          BASE
    if ((sailingVessel && length > 12 || !sailingVessel && length >= 9) && tariff === BASE) {
        t5 = T5BASEBIGBOATS;
        t0 = T0;
    }
    //   VELERO          MENOR DE 12M  O   MOTOR           MENOR DE 9M          BASE
    else if ((sailingVessel && length < 12 || !sailingVessel && length < 9) && tariff === BASE) {
        t5 = T5BASE;
        t0 = 0;
    }
    //   VELERO          MENOR DE 12M  O   MOTOR           MENOR DE 9M          TRANSITO
    else if ((sailingVessel && length < 12 || !sailingVessel && length < 9) && tariff === TRANSIT) {
        t5 = T5TRANSIT;
        if (!sailingVessel) { //ahor los motores de menos de 9m tmb pagan t0
            t0 = T0;
        } else {
            t0 = 0;
        }
    }
    //   VELERO          MAYOR DE 12M  O   MOTOR           MAYOR DE 9M          TRANSITO
    else {
        t5 = T5TRANSITBIGBOATS;
        t0 = T0;
    }
}

function printVariablesInInputs() {
    $("#booking-input").val(booking);
    $("#name-input").val(capitan);
    $("#vessel-input").val(vessel);
    $("#email-input").val(email);
    $("#arrival-input").val(arrival);
    $("#departure-input").val(departure);
    $("#nights-input").val(nights);
    $("#length-input").val(length);
    $("#beam-input").val(beam);
    
}

function main() {

    printVariablesInInputs();
    getTariff();
    getDiscount();
    calculatePrice();
    printMail();
}
//register any change in the input and updates variables
$(".form-floating").change(function () {
    booking = $("#booking-input").val();
    capitan = $("#name-input").val();
    vessel = $("#vessel-input").val();
    email = $("#email-input").val();
    arrival = $("#arrival-input").val();
    departure = $("#departure-input").val();
    nights = parseInt($("#nights-input").val());
    length = $("#length-input").val();
    beam = $("#beam-input").val();
    if ($("#sailingVessel-input").val() === "false") {
        sailingVessel = false;
    } else {
        sailingVessel = true;
    }
        
    main();
});

function createEmailFormat() {
    //Construyo el mailto 
    target = "mailto:" + email + "?subject=Reserva: " + vessel + " " + length + "m x " + beam + "m&body=" + emailTemplate;
}
//$(body.)
$(".english-email").click(function(){ // si lo quiere ingles lo mando tal cual
    printMail();
    download("plantila.oft", emailTemplate);
    //$(".english-email").attr("href", target); 
});
$(".spanish-email").click(function(){ // sil o quiere español al pulsar el botón traduzco y pa lante
    printMailEs();
    $(".spanish-email").attr("href", target);
    //download("plantila.oft", emailTemplate);
});

$(".copy").click(function(){
    let temp = $("<textarea>");

    $("body").append(temp);
    $email = $(".email");
    console.log($email.html());
    temp.val($email.html().replace(/<br>/g, "")).select();
    document.execCommand("copy");
    temp.remove();
    
});

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

//mailto:direccion@destinatario.com?cc=copia@destinatario.com;segundacopia@destinatario.com&bcc=copiaoculta@destinatario.com&subject=Asunto%20con%20espacios&body=Este%20es%20el%20cuerpo%20del%20mensaje.
