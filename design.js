function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat Window</title>
        <style>
            body {
                background-color: black;
                color: green;
                font-family: 'Courier New', Courier, monospace;
                margin: 0;
                padding: 10px;
            }
            #chat-container {
                display: flex;
                flex-direction: column;
                height: 90vh;
                overflow-y: auto;
            }
            .message {
                margin: 5px;
                padding: 8px;
                border-radius: 4px;
            }
            .user-message {
                align-self: flex-end;
                background-color: #0d630d;
            }
            .response-message {
                align-self: flex-start;
                background-color: #003300;
            }
        </style>
    </head>
    <body>
        <div id="chat-container"></div>
        <input type="text" id="messageInput" placeholder="Type a message">
        <button onclick="sendMessage()">Send</button>

        <script>
            const vscode = acquireVsCodeApi();

            function sendMessage() {
                const input = document.getElementById('messageInput');
                const message = input.value;
                input.value = ''; // Clear input field after sending
                appendMessage(message, 'user');
                vscode.postMessage({
                    command: 'sendMessage',
                    text: message
                });
            }

            function appendMessage(message, sender) {
                const container = document.getElementById('chat-container');
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'response-message');
                messageElement.textContent = message;
                container.appendChild(messageElement);
                container.scrollTop = container.scrollHeight; // Scroll to bottom
            }

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'newMessage') {
                    message.text.split('\\n').forEach(line => {
                        appendMessage(line, 'response');
                    });
                }
            });
        </script>
    </body>
    </html>`;
}
