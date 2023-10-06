// Set the date you're counting down to
const countDownDate = new Date("October 06, 2023 21:00:00").getTime();

const updateCounter = () => {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    // Time calculations for hours and minutes
    let hours = Math.floor(distance / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 99) {
        // Time calculations for days and hours
        hours = Math.floor(distance / (1000 * 60 * 60 * 24));
        minutes = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.querySelector('.timer-card.label.one').setAttribute('data-label', 'DAY');
        document.querySelector('.timer-card.label.two').setAttribute('data-label', 'HOUR');
    } else {
        document.querySelector('.timer-card.label.one').setAttribute('data-label', 'HOUR');
        document.querySelector('.timer-card.label.two').setAttribute('data-label', 'MIN');    
    }

    minutes++;

    // Split the hours and minutes into tens and ones
    const hourTens = Math.floor(hours / 10);
    const hourOnes = hours % 10;

    const minuteTens = Math.floor(minutes / 10);
    const minuteOnes = minutes % 10;

    document.querySelectorAll('.timer-card')[0].innerText = hourTens;
    document.querySelectorAll('.timer-card')[1].innerText = hourOnes;
    document.querySelectorAll('.timer-card')[2].innerText = minuteTens;
    document.querySelectorAll('.timer-card')[3].innerText = minuteOnes;

    if (hours <= 0 && minutes <= 0) {
        clearInterval(interval);
        // Handle what happens when the countdown reaches 0, for example:
        // document.querySelector('.countdown-container').innerText = 'Time's Up!';
    }
}

// Update the countdown every second
const interval = setInterval(updateCounter, 1000);
