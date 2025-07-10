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
    const cometCount = 20;
    const starCount = 100;
    
    // Создание звезд
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    // Создание комет
    for (let i = 0; i < cometCount; i++) {
        comets.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 2,
            speed: Math.random() * 2 + 1,
            opacity: 0
        });
    }
    
    function animateCosmic() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Рисование звезд
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        });
        
        // Рисование и анимация комет
        comets.forEach(comet => {
            comet.x -= comet.speed;
            comet.y -= comet.speed;
            comet.opacity = Math.min(comet.opacity + 0.01, 0.8);
            
            if (comet.x < -comet.size || comet.y < -comet.size) {
                comet.x = canvas.width + comet.size;
                comet.y = canvas.height + comet.size;
                comet.opacity = 0;
            }
            
            ctx.beginPath();
            ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 183, 235, ${comet.opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animateCosmic);
    }
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    animateCosmic();
});