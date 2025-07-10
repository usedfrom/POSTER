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
    const clouds = [];
    const starCount = 80;
    const cometCount = 2;
    const cloudCount = 5;
    const neonColors = ['#ff4d4d', '#00ccff', '#ff00cc'];
    const cloudColors = ['rgba(200, 200, 200, 0.2)', 'rgba(255, 100, 100, 0.2)', 'rgba(100, 150, 255, 0.2)'];

    // Создание звезд
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.4 + 0.3,
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
        });
    }

    // Создание комет
    for (let i = 0; i < cometCount; i++) {
        comets.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 20 + 15,
            speed: Math.random() * 1.5 + 0.5,
            angle: Math.random() * Math.PI * 2,
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
        });
    }

    // Создание облаков
    for (let i = 0; i < cloudCount; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 100 + 50,
            opacity: Math.random() * 0.1 + 0.1,
            color: cloudColors[Math.floor(Math.random() * cloudColors.length)]
        });
    }

    function animateCosmic() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Рисование облаков
        clouds.forEach(cloud => {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.fillStyle = cloud.color;
            ctx.globalAlpha = cloud.opacity;
            ctx.fill();
            cloud.x += 0.1;
            if (cloud.x > canvas.width + cloud.size) cloud.x = -cloud.size;
        });

        // Рисование звезд
        ctx.globalAlpha = 1;
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity;
            ctx.fill();
            star.opacity = Math.max(0.3, star.opacity + (Math.random() - 0.5) * 0.01);
        });

        // Рисование комет
        ctx.globalAlpha = 1;
        comets.forEach(comet => {
            const dx = Math.cos(comet.angle) * comet.speed;
            const dy = Math.sin(comet.angle) * comet.speed;
            comet.x += dx;
            comet.y += dy;

            if (comet.x < -comet.length || comet.x > canvas.width + comet.length || comet.y < -comet.length || comet.y > canvas.height + comet.length) {
                comet.x = Math.random() * canvas.width;
                comet.y = Math օждем.random() * canvas.height;
                comet.angle = Math.random() * Math.PI * 2;
                comet.color = neonColors[Math.floor(Math.random() * neonColors.length)];
            }

            // Рисование хвоста с неоновым шлейфом
            const gradient = ctx.createLinearGradient(comet.x, comet.y, comet.x - dx * comet.length, comet.y - dy * comet.length);
            gradient.addColorStop(0, comet.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.beginPath();
            ctx.moveTo(comet.x, comet.y);
            ctx.lineTo(comet.x - dx * comet.length, comet.y - dy * comet.length);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        requestAnimationFrame(animateCosmic);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    animateCosmic();

    // Обработка текстового ввода
    textButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Обработка голосового ввода
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceButton.addEventListener('click', () => {
        recognition.start();
        voiceButton.style.background = '#ff4d4d';
    });

    recognition.onresult = (event) => {
        const message = event.results[0][0].transcript;
        userInput.value = message;
        sendMessage();
        voiceButton.style.background = 'var(--cosmic-neon-blue)';
    };

    recognition.onerror = () => {
        chatHistory.push({ role: 'assistant', content: '> Ошибка распознавания голоса. Попробуйте снова.' });
        updateChat();
        voiceButton.style.background = 'var(--cosmic-neon-blue)';
    };

    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : '';

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        if (message.length > 500) {
            chatHistory.push({ role: 'assistant', content: '> Ошибка: Вопрос слишком длинный. Максимум 500 символов.' });
            updateChat();
            return;
        }

        chatHistory.push({ role: 'user', content: message });
        updateChat();
        userInput.value = '';

        try {
            const response = await fetch(`${baseUrl}/api/openai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Ты — вдохновляющий AI-ассистент. Отвечай на любой вопрос пользователя в формате:\n[Что если]: [Короткая, мощная и вдохновляющая фраза].\n\n[Значит]: [Краткое разъяснение цитаты, мотивирующее и вдохновляющее].\nКаждый заголовок ([Что если], [Значит]) начинается с новой строки, между ними пустая строка. Стиль — лаконичный, позитивный, энергичный. Пример:\n[Что если]: Кто управляет своими эмоциями, тот управляет своей судьбой.\n\n[Значит]: Учись распознавать и направлять эмоции, а не поддаваться им.'
                        },
                        ...chatHistory
                    ],
                    max_tokens: 200,
                    temperature: 0.8
                })
            });

            if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                const agentMessage = data.choices[0].message.content;
                chatHistory.push({ role: 'assistant', content: agentMessage });
                updateChat();
                generateImage(agentMessage);
            } else {
                throw new Error('Нет ответа от API');
            }
        } catch (error) {
            chatHistory.push({ role: 'assistant', content: `> Ошибка: Не удалось связаться с ядром AI. ${error.message}.` });
            updateChat();
        }
    }

    function updateChat() {
        chatBody.innerHTML = '';
        chatHistory.forEach(msg => {
            const div = document.createElement('div');
            div.className = `chat-message ${msg.role}`;
            div.textContent = `> ${msg.content}`;
            chatBody.appendChild(div);
        });
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function generateImage(text) {
        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = 540;
        imgCanvas.height = 960;
        const imgCtx = imgCanvas.getContext('2d');

        // Космический фон
        const gradient = imgCtx.createRadialGradient(270, 480, 0, 270, 480, 600);
        gradient.addColorStop(0, '#1c1c2a');
        gradient.addColorStop(1, '#0a0a0a');
        imgCtx.fillStyle = gradient;
        imgCtx.fillRect(0, 0, 540, 960);

        // Добавление облаков
        for (let i = 0; i < 10; i++) {
            imgCtx.beginPath();
            imgCtx.arc(
                Math.random() * 540,
                Math.random() * 960,
                Math.random() * 80 + 40,
                0,
                Math.PI * 2
            );
            imgCtx.fillStyle = cloudColors[Math.floor(Math.random() * cloudColors.length)];
            imgCtx.globalAlpha = 0.2;
            imgCtx.fill();
        }

        // Добавление неоновых звезд
        for (let i = 0; i < 20; i++) {
            imgCtx.beginPath();
            imgCtx.arc(
                Math.random() * 540,
                Math.random() * 960,
                Math.random() * 1.5,
                0,
                Math.PI * 2
            );
            imgCtx.fillStyle = neonColors[Math.floor(Math.random() * neonColors.length)];
            imgCtx.globalAlpha = 1;
            imgCtx.fill();
        }

        // Обработка текста
        imgCtx.font = 'bold 36px Arial';
        imgCtx.fillStyle = '#e6f0ff';
        imgCtx.textAlign = 'center';
        imgCtx.textBaseline = 'middle';

        const lines = text.split('\n').filter(line => line.trim());
        let y = 180;
        const maxWidth = 480;
        const lineHeight = 45;

        lines.forEach(line => {
            const words = line.split(' ');
            let currentLine = '';
            for (let word of words) {
                const testLine = currentLine + word + ' ';
                const metrics = imgCtx.measureText(testLine);
                if (metrics.width > maxWidth) {
                    imgCtx.fillText(currentLine, 270, y);
                    currentLine = word + ' ';
                    y += lineHeight;
                } else {
                    currentLine = testLine;
                }
            }
            imgCtx.fillText(currentLine, 270, y);
            y += lineHeight * 1.3;
        });

        const img = new Image();
        img.src = imgCanvas.toDataURL('image/png');
        imageOutput.innerHTML = '';
        imageOutput.appendChild(img);

        const downloadLink = document.createElement('a');
        downloadLink.href = img.src;
        downloadLink.download = 'ai_response.png';
        downloadLink.textContent = 'Скачать изображение';
        downloadLink.style.display = 'block';
        downloadLink.style.color = 'var(--cosmic-neon-blue)';
        downloadLink.style.marginTop = '0.5rem';
        downloadLink.style.fontSize = '0.9rem';
        imageOutput.appendChild(downloadLink);
    }
});
