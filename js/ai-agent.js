document.addEventListener('DOMContentLoaded', function() {
    const sendTextButton = document.getElementById('sendTextButton');
    const sendVoiceButton = document.getElementById('sendVoiceButton');
    const userInput = document.getElementById('userInput');
    const chatBody = document.getElementById('chatBody');
    const resultImage = document.getElementById('resultImage');
    
    let chatHistory = [];
    
    // Определяем базовый URL для API
    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : '';
    
    // Эффекты для кнопок
    [sendTextButton, sendVoiceButton].forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 20px rgba(0, 183, 235, 0.5)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
    
    // Текстовый ввод
    sendTextButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Голосовой ввод
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    sendVoiceButton.addEventListener('click', () => {
        recognition.start();
        sendVoiceButton.style.background = 'rgba(0, 183, 235, 0.3)';
        sendVoiceButton.querySelector('.button-label').textContent = 'СЛУШАЮ...';
    });
    
    recognition.onresult = (event) => {
        const message = event.results[0][0].transcript;
        userInput.value = message;
        sendMessage();
        sendVoiceButton.style.background = 'rgba(0, 183, 235, 0.1)';
        sendVoiceButton.querySelector('.button-label').textContent = 'ГОЛОС';
    };
    
    recognition.onend = () => {
        sendVoiceButton.style.background = 'rgba(0, 183, 235, 0.1)';
        sendVoiceButton.querySelector('.button-label').textContent = 'ГОЛОС';
    };
    
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Ты — AI-ассистент, создающий вдохновляющие цитаты по любой теме, заданной пользователем. Формат ответа: \n**Суть дня**: [Краткое вдохновляющее утверждение, задающее тон дня].\n**Цитата**: [Короткая, мощная фраза, вдохновляющая на действие или размышление].\n**Пояснение**: [Краткое объяснение смысла цитаты, мотивирующее и поддерживающее].\nСтиль — лаконичный, вдохновляющий, с элементами киберпанка. Используй термины: "сила", "энергия", "цель", "путь". Игнорируй вопросы, выходящие за рамки создания цитат, и перенаправляй к теме вдохновения. Пример:\n**Суть дня**: Сегодня ты создаешь свой путь.\n**Цитата**: Сила твоего пути — в каждом сделанном шаге.\n**Пояснение**: Каждый выбор приближает тебя к цели — двигайся с энергией и верой.'
                        },
                        ...chatHistory
                    ],
                    max_tokens: 200,
                    temperature: 0.7
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
            chatHistory.push({ role: 'assistant', content: `> Ошибка_системы: Не удалось связаться с ядром AI. ${error.message}. Попробуйте снова.` });
            updateChat();
        }
    }
    
    function updateChat() {
        chatBody.innerHTML = '';
        chatHistory.forEach(msg => {
            const div = document.createElement('div');
            div.className = `chat-message ${msg.role === 'user' ? 'user' : 'agent'}`;
            div.textContent = msg.role === 'user' ? `> ${msg.content}` : msg.content;
            chatBody.appendChild(div);
        });
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    function generateImage(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 576; // 9x16
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Фон с кометами и звездами
        ctx.fillStyle = 'radial-gradient(circle at center, #1c2526 0%, #0a0a0a 100%)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Генерация звезд
        const stars = [];
        const starCount = 50;
        const neonColors = ['#00ffcc', '#ff00ff', '#00b7eb'];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1 + 0.5,
                color: neonColors[Math.floor(Math.random() * neonColors.length)]
            });
        }
        
        // Генерация комет
        const comets = [];
        const cometCount = 10;
        for (let i = 0; i < cometCount; i++) {
            comets.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1 + 1,
                color: neonColors[Math.floor(Math.random() * neonColors.length)]
            });
        }
        
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
        
        // Рисование комет
        comets.forEach(comet => {
            ctx.beginPath();
            ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI * 2);
            ctx.fillStyle = comet.color;
            ctx.shadowColor = comet.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        
        // Настраиваемые параметры текста
        const fontSizeBold = 66; // Размер жирного шрифта (для заголовков: Суть дня, Цитата, Пояснение)
        const fontSizeRegular = 60; // Размер обычного шрифта (для текста)
        const lineHeight = 80; // Межстрочный интервал (расстояние между строками)
        const padding = 60; // Отступы со всех сторон (в пикселях)
        const maxWidth = canvas.width - 2 * padding; // Максимальная ширина текста (в пикселях)
        const verticalSpacingFactor = 1.2; // Множитель для равномерного распределения строк по высоте
        
        // Как настроить параметры:
        // - fontSizeBold: Увеличьте/уменьшите для изменения размера заголовков (например, 70 для больше, 50 для меньше).
        // - fontSizeRegular: Увеличьте/уменьшите для изменения размера основного текста (например, 65 или 45).
        // - lineHeight: Увеличьте для большего расстояния между строками (например, 90), уменьшите для компактности (например, 70).
        // - padding: Увеличьте для больших отступов от краев (например, 80), уменьшите для меньших (например, 40).
        // - verticalSpacingFactor: Увеличьте (например, 1.5) для большего расстояния между строками, уменьшите (например, 1.0) для более компактного распределения.
        // - maxWidth: Не меняйте вручную, он рассчитывается как canvas.width - 2 * padding.
        
        // Текст
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Разбиваем текст на строки
        const lines = text.split('\n').map(line => line.trim());
        const wrappedLines = [];
        
        // Обертка текста
        lines.forEach(line => {
            if (line.startsWith('**Суть дня**') || line.startsWith('**Цитата**') || line.startsWith('**Пояснение**')) {
                ctx.font = `bold ${fontSizeBold}px Courier New`;
                wrappedLines.push({ text: line, bold: true });
            } else {
                ctx.font = `${fontSizeRegular}px Courier New`;
                const words = line.split(' ');
                let currentLine = '';
                words.forEach(word => {
                    const testLine = currentLine + word + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth) {
                        wrappedLines.push({ text: currentLine.trim(), bold: false });
                        currentLine = word + ' ';
                    } else {
                        currentLine = testLine;
                    }
                });
                if (currentLine) wrappedLines.push({ text: currentLine.trim(), bold: false });
            }
        });
        
        // Распределяем текст равномерно по высоте
        const textAreaHeight = canvas.height - 2 * padding; // Высота области для текста (1024 - 120 = 904 пикселя)
        const totalTextHeight = wrappedLines.length * lineHeight * verticalSpacingFactor;
        const startY = padding; // Начинаем с верхнего отступа
        const spacing = (textAreaHeight - (wrappedLines.length * lineHeight)) / (wrappedLines.length + 1); // Равномерные промежутки
        
        // Рендеринг текста
        wrappedLines.forEach((lineObj, index) => {
            ctx.font = lineObj.bold ? `bold ${fontSizeBold}px Courier New` : `${fontSizeRegular}px Courier New`;
            ctx.fillStyle = '#00ffcc';
            const yPosition = startY + (index + 1) * spacing + (index * lineHeight);
            ctx.fillText(lineObj.text, canvas.width / 2, yPosition);
        });
        
        // Отображение и скачивание
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        resultImage.innerHTML = '';
        resultImage.appendChild(img);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = img.src;
        downloadLink.download = 'inspiration.png';
        downloadLink.textContent = 'Скачать изображение';
        downloadLink.style.display = 'block';
        downloadLink.style.color = '#00ffcc';
        downloadLink.style.marginTop = '10px';
        resultImage.appendChild(downloadLink);
    }
});
