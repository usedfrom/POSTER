document.addEventListener('DOMContentLoaded', function() {
    // Анимация комет и звезд
    const cosmicBackground = document.querySelector('.cosmic-background');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cosmicBackground.appendChild(canvas);
    
    const comets = [];
    const stars = [];
    const cometCount = 30;
    const starCount = 150;
    const neonColors = ['#00ffcc', '#ff00ff', '#00b7eb'];
    
    // Создание звезд
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1 + 0.5, // Меньший размер
            color: neonColors[Math.floor(Math.random() * neonColors.length)],
            opacity: Math.random() * 0.6 + 0.4
        });
    }
    
    // Создание комет
    for (let i = 0; i < cometCount; i++) {
        comets.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1 + 1, // Меньший размер
            speed: Math.random() * 1.5 + 0.5,
            color: neonColors[Math.floor(Math.random() * neonColors.length)],
            opacity: 0
        });
    }
    
    function animateCosmic() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Рисование звезд
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.shadowColor = star.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        
        // Рисование и анимация комет
        comets.forEach(comet => {
            comet.x -= comet.speed;
            comet.y -= comet.speed;
            comet.opacity = Math.min(comet.opacity + 0.02, 1);
            
            if (comet.x < -comet.size || comet.y < -comet.size) {
                comet.x = canvas.width + comet.size;
                comet.y = canvas.height + comet.size;
                comet.opacity = 0;
            }
            
            ctx.beginPath();
            ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI * 2);
            ctx.fillStyle = comet.color;
            ctx.shadowColor = comet.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        
        requestAnimationFrame(animateCosmic);
    }
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    animateCosmic();
});
