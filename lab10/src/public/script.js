// Gate of Moria — Frontend Client Logic
// Handles: boot greeting, chat flow, typing indicator, door open toggle, history persistence

(() => {
    const chatEl = document.getElementById('chat');
    const formEl = document.getElementById('composer');
    const promptEl = document.getElementById('prompt');
    const sendBtn = document.getElementById('sendBtn');
    const doorEl = document.getElementById('door');
    const doorClosedEl = document.getElementById('doorClosed');
    const doorOpenEl = document.getElementById('doorOpen');

    const LS_HISTORY = 'moria.chat.history.v1';
    const LS_DOOR = 'moria.door.open';

    const state = {
        history: loadHistory(),
        opened: localStorage.getItem(LS_DOOR) === '1',
    };

    function loadHistory() {
        try {
            const raw = localStorage.getItem(LS_HISTORY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) return arr.filter(m => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'ai'));
            return [];
        } catch {
            return [];
        }
    }

    function saveHistory() {
        try {
            const trimmed = state.history.slice(-60); // cap history
            localStorage.setItem(LS_HISTORY, JSON.stringify(trimmed));
        } catch {
            // ignore storage errors
        }
    }

    function addMessage(role, text, { transient = false } = {}) {
        const msg = document.createElement('div');
        msg.className = `msg ${role}`;
        const who = document.createElement('div');
        who.className = 'who';
        who.textContent = role === 'user' ? 'You' : 'Gatekeeper';
        const body = document.createElement('div');
        body.className = 'text';
        body.textContent = text;
        msg.appendChild(who);
        msg.appendChild(body);
        chatEl.appendChild(msg);
        chatEl.scrollTop = chatEl.scrollHeight;

        if (!transient) {
            state.history.push({ role, text });
            saveHistory();
        }
        return msg;
    }

    function showTyping() {
        const msg = document.createElement('div');
        msg.className = 'msg ai typing';
        const who = document.createElement('div');
        who.className = 'who';
        who.textContent = 'Gatekeeper';
        const text = document.createElement('div');
        text.className = 'text';
        const dots = document.createElement('div');
        dots.className = 'dots';
        dots.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        text.appendChild(dots);
        msg.appendChild(who);
        msg.appendChild(text);
        chatEl.appendChild(msg);
        chatEl.scrollTop = chatEl.scrollHeight;
        return msg;
    }

    function openDoor() {
        try {
            doorEl.classList.add('open');
            localStorage.setItem(LS_DOOR, '1');
        } catch {
            /* noop */
        }
    }

    function closeDoor() {
        try {
            doorEl.classList.remove('open');
            localStorage.removeItem(LS_DOOR);
        } catch {
            /* noop */
        }
    }

    function replySuggestsOpen(str) {
        return typeof str === 'string' && /(doors? of durin.*open|swing open|you may enter|open\b)/i.test(str);
    }

    function extractReply(payload) {
        if (!payload) return '';

        // Standard lab response shape { data, error, meta }
        if (Object.prototype.hasOwnProperty.call(payload, 'data')) {
            const d = payload.data;
            if (typeof d === 'string') return d;
            if (d && typeof d.text === 'string') return d.text;
            if (d && typeof d.reply === 'string') return d.reply;
            if (d && typeof d.message === 'string') return d.message;
            if (Array.isArray(d?.messages) && d.messages.length) {
                const last = d.messages[d.messages.length - 1];
                if (typeof last === 'string') return last;
                if (last && typeof last.text === 'string') return last.text;
            }
        }

        // OpenAI SDK convenience
        if (typeof payload.output_text === 'string') return payload.output_text;

        if (typeof payload === 'string') return payload;
        return '';
    }

    async function boot() {
        // Render existing history if we have it
        if (state.history.length) {
            chatEl.innerHTML = '';
            for (const m of state.history) addMessage(m.role, m.text, { transient: true });
            if (state.opened) openDoor();
            return;
        }

        // Otherwise, fetch the Gatekeeper greeting
        const typing = showTyping();
        try {
            const res = await fetch('/api/v1/moria/start');
            const json = await res.json().catch(() => ({}));
            typing.remove();
            const text = extractReply(json) || 'I am the Gatekeeper of Durin\'s Door. Speak the answer to my riddle and the way shall be opened.';
            addMessage('ai', text);
        } catch (err) {
            typing.remove();
            addMessage('ai', 'The west wind carries no reply... Is the server running? Try `npm run dev` then reload.');
        }
    }

    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = promptEl.value.trim();
        if (!userText) return;

        sendBtn.disabled = true;
        promptEl.disabled = true;

        addMessage('user', userText);
        const typing = showTyping();

        try {
            const res = await fetch('/api/v1/moria/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send both keys for maximum compatibility with students' controllers
                body: JSON.stringify({ prompt: userText, text: userText })
            });
            const json = await res.json().catch(() => ({}));
            typing.remove();
            const reply = extractReply(json) || '...the stones remain silent.';
            addMessage('ai', reply);

            if (replySuggestsOpen(reply) || /^(friend|mellon)\b/i.test(userText)) {
                openDoor();
            }
        } catch (err) {
            typing.remove();
            addMessage('ai', 'Mysterious silence from within the mountain. Check your internet and server.');
        } finally {
            promptEl.value = '';
            promptEl.disabled = false;
            sendBtn.disabled = false;
            promptEl.focus();
        }
    });

    // Keep chat scrolled when tab becomes active again
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) chatEl.scrollTop = chatEl.scrollHeight;
    });

    // Initialize door based on stored state
    if (state.opened) openDoor();

    // Start
    boot();
})();