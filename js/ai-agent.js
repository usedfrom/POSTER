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
                            content: 'Ты — AI-ассистент, создающий вдохновляющие цитаты по любой теме, заданной пользователем. Формат ответа: \n**Цитата**: [Короткая, мощная фраза, вдохновляющая на действие или размышление].\n**Пояснение**: [Краткое объяснение смысла цитаты, мотивирующее и поддерживающее].\nСтиль — лаконичный, вдохновляющий, с элементами киберпанка. Используй термины: "сила", "энергия", "цель", "путь". Игнорируй вопросы, выходящие за рамки создания цитат, и перенаправляй к теме вдохновения. Пример:\n**Цитата**: Сила твоего пути — в каждом сделанном шаге.\n**Пояснение**: Каждый выбор приближает тебя к цели — двигайся с энергией и верой.'
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
        canvas.width = 576; // 9x16 для телефона
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Фон
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Текст
        ctx.font = 'bold 24px Courier New';
        ctx.fillStyle = '#00b7eb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Разбиваем текст на строки
        const lines = text.split('\n');
        const lineHeight = 40;
        const startY = canvas.height / 2 - (lines.length * lineHeight) / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
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
        downloadLink.style.color = '#00b7eb';
        downloadLink.style.marginTop = '10px';
        resultImage.appendChild(downloadLink);
    }
});