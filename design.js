
function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chat Window</title>
            <style>
                body { font-family: 'Courier New', Courier, monospace; background-color: black; color: green; }
                #chat-container { display: flex; flex-direction: column; padding: 10px; }
                .message { margin-bottom: 10px; }
                .user { align-self: end; }
                .response { align-self: start; }
                .loader { border: 4px solid #f3f3f3; border-top: 4px solid green; border-radius: 50%; width: 20px; height: 20px; animation: spin 2s linear infinite; align-self: center; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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
                    input.value = '';
                    appendMessage(message, 'user');
                    showLoader();
                    vscode.postMessage({ command: 'sendMessage', text: message });
                }

                function appendMessage(text, sender) {
                    const container = document.getElementById('chat-container');
                    const messageDiv = document.createElement('div');
                    messageDiv.textContent = text;
                    messageDiv.className = 'message ' + sender;
                    container.appendChild(messageDiv);
                    container.scrollTop = container.scrollHeight;
                }

                function showLoader() {
                    const loaderElement = document.createElement('div');
                    loaderElement.classList.add('loader');
                    loaderElement.id = 'loader';
                    const container = document.getElementById('chat-container');
                    container.appendChild(loaderElement);
                    container.scrollTop = container.scrollHeight;
                }

                function hideLoader() {
                    const loaderElement = document.getElementById('loader');
                    if (loaderElement) {
                        loaderElement.remove();
                    }
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'newMessage') {
                        hideLoader();
                        message.text.split('\\n').forEach(line => {
                            appendMessage(line, 'response');
                        });
                    }
                });
            </script>
        </body>
        </html>`;
}
