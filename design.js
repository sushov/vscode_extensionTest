function getWebviewContent() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Window</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
        #chat-container { display: flex; flex-direction: column; height: 100vh; }
        #message-container { flex-grow: 1; overflow-y: auto; padding: 10px; background: #ffffff; display: flex; flex-direction: column; gap: 10px; }
        #input-container { display: flex; align-items: center; padding: 10px; background: #fff; border-top: 1px solid #ddd; }
        #messageInput { flex-grow: 1; padding: 10px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px; }
        button { padding: 10px 15px; background-color: #0078d7; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #0056a3; }
        .message { padding: 10px; border-radius: 8px; max-width: 70%; }
        .user-message { background-color: #e1f5fe; align-self: flex-end; }
        .response-message { background-color: #e0e0e0; align-self: flex-start; }
    </style>
</head>
<body>
    <div id="chat-container">
        <div id="message-container"></div>
        <div id="input-container">
            <input type="text" id="messageInput" placeholder="Type a message">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function appendMessage(message, sender='user') {
            const messageContainer = document.getElementById('message-container');
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'response-message');
            messageDiv.textContent = message;
            messageContainer.appendChild(messageDiv);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }

        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            if (message) {
                appendMessage(message);
                vscode.postMessage({ command: 'sendMessage', text: message });
                messageInput.value = '';
            }
        }

        window.addEventListener('message', event => {
            if (event.data.command === 'newMessage') {
                appendMessage(event.data.text, 'response');
            }
        });
    </script>
</body>
</html>
`;
}
