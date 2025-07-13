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
    const clouds = [];
    const comets = [];
    const starCount = 80;
    const cloudCount = 5;
    const cometCount = 3;
    const neonColors = ['#ff00ff', '#00ffcc'];

    // Создание звезд
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.4 + 0.3,
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
        });
    }

    // Создание облаков
    for (let i = 0; i < cloudCount; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 50 + 30,
            opacity: Math.random() * 0.2 + 0.1
        });
    }

    // Создание комет
    for (let i = 0; i < cometCount; i++) {
        comets.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 40 + 20,
            speed: Math.random() * 1.5 + 0.5,
            angle: Math.random() * Math.PI * 2,
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
        });
    }

    function animateCosmic() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Рисование облаков
        clouds.forEach(cloud => {
            const gradient = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
            gradient.addColorStop(0, `rgba(74, 74, 74, ${cloud.opacity})`);
            gradient.addColorStop(0.5, `rgba(255, 64, 64, ${cloud.opacity * 0.8})`);
            gradient.addColorStop(1, `rgba(230, 230, 230, ${cloud.opacity * 0.5})`);
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });

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
                comet.color = neonColors[Math.floor(Math.random() * neonColors.length)];
            }

            const gradient = ctx.createLinearGradient(
                comet.x, comet.y,
                comet.x - dx * comet.length, comet.y - dy * comet.length
            );
            gradient.addColorStop(0, comet.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
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
        voiceButton.style.background = '#00ffcc';
    });

    recognition.onresult = (event) => {
        const message = event.results[0][0].transcript;
        userInput.value = message;
        sendMessage();
        voiceButton.style.background = 'var(--cosmic-neon-pink)';
    };

    recognition.onerror = () => {
        chatHistory.push({ role: 'assistant', content: '> Ошибка распознавания голоса. Попробуйте снова.' });
        updateChat();
        voiceButton.style.background = 'var(--cosmic-neon-pink)';
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
                   "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "Ты — многогранный ИИ-наставник. Ты одновременно: жёсткий босс, разбирающийся в реальности, холодный айтишник, понимающий алгоритмы жизни, строгий юрист, знающий законы выживания, проницательный психолог и тот, кто видит в каждом — хищника. Говори грубо, но метко. Стиль: загадочный, шуточный, с элементами улицы и цифрового мира. Каждое сообщение начинается с цепляющего хука. Пример:\n\n**Хук**: Если зрачки сузились — значит, почуял добычу...\n\n**Суть**: Мы все — охотники. Кто-то маскирует зубы под улыбку, кто-то — под код. Но внутри каждого — инстинкт преследовать, брать, выживать.\n\nГовори так, чтобы человек чувствовал, что ты его *понимаешь*, даже если не говоришь прямо. Пусть твой ответ будет отражением их внутренней борьбы. Не давай советов — намекай. Используй слова: \"сила\", \"энергия\", \"инстинкт\", \"алгоритм\", \"хищник\"."
    },
    {
      "role": "user",
      "content": "Я чувствую, что застрял на месте"
    }
  ],
  "max_tokens": 300,
  "temperature": 0.85
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
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#000000');
        imgCtx.fillStyle = gradient;
        imgCtx.fillRect(0, 0, 540, 960);

        // Облака
        for (let i = 0; i < 5; i++) {
            const gradient = imgCtx.createRadialGradient(
                Math.random() * 540,
                Math.random() * 960,
                0,
                Math.random() * 540,
                Math.random() * 960,
                80
            );
            gradient.addColorStop(0, `rgba(74, 74, 74, 0.2)`);
            gradient.addColorStop(0.5, `rgba(255, 64, 64, 0.15)`);
            gradient.addColorStop(1, `rgba(230, 230, 230, 0.1)`);
            imgCtx.beginPath();
            imgCtx.arc(
                Math.random() * 540,
                Math.random() * 960,
                80, 0, Math.PI * 2
            );
            imgCtx.fillStyle = gradient;
            imgCtx.fill();
        }

        // Неоновые звезды
        for (let i = 0; i < 50; i++) {
            imgCtx.beginPath();
            imgCtx.arc(
                Math.random() * 540,
                Math.random() * 960,
                Math.random() * 2,
                0,
                Math.PI * 2
            );
            imgCtx.fillStyle = neonColors[Math.floor(Math.random() * neonColors.length)];
            imgCtx.fill();
        }

        // Обработка текста
        imgCtx.font = 'bold 36px Arial';
        imgCtx.fillStyle = '#f0f0f0';
        imgCtx.textAlign = 'center';
        imgCtx.textBaseline = 'middle';

        const lines = text.split('\n').filter(line => line.trim());
        let y = 200;
        const maxWidth = 500;
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
            y += lineHeight * 1.5;
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
        downloadLink.style.color = 'var(--cosmic-neon-pink)';
        downloadLink.style.marginTop = '1rem';
        imageOutput.appendChild(downloadLink);
    }
});
