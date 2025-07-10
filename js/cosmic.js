document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById('userInput');
    const textButton = document.getElementById('textButton');
    const voiceButton = document.getElementById('voiceButton');
    const chatBody = document.getElementById('chatBody');
    const imageOutput = document.getElementById('imageOutput');
    let chatHistory = [];

    // Космическая анимация фона
    const cosmicBackground = document.querySelector('.cosmic-background');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cosmicBackground.appendChild(canvas);

    const stars = [];
    const comets = [];
    const starCount = 100;
    const cometCount = 5;
    const neonColors = ['#00e6ff', '#ff00cc', '#00ff99'];

    // Создание звезд
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.5,
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
        });
    }

    // Создание комет
    for (let i = 0; i < cometCount; i++) {
        comets.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 30 + 20,
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
        });
    }

    function animateCosmic() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Рисование звезд
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity;
            ctx.fill();
            star.opacity = Math.max(0.3, star.opacity + (Math.random() - 0.5) * 0.02);
        });
        ctx.globalAlpha = 1;

        // Рисование комет
        comets.forEach(comet => {
            const dx = Math.cos(comet.angle) * comet.speed;
            const dy = Math.sin(comet.angle) * comet.speed;
            comet.x += dx;
            comet.y += dy;

            if (comet.x < 0 || comet.x > canvas.width || comet.y < 0 || comet.y > canvas.height) {
                comet.x = Math.random() * canvas.width;
                comet.y = Math.random() * canvas.height;
                comet.angle = Math.random() * Math.PI * 2;
                comet.color = neonColors[Math.floor(Math.random() * neonColors.length
System: * Today's date and time is 11:02 AM CEST on Thursday, July 10, 2025.
