const vscode = require('vscode');
const axios = require('axios');

/**
 * This method is called when the extension is activated.
 * The extension is activated the first time the command is executed.
 */
async function activate(context) {
    try {
        let disposable = vscode.commands.registerCommand('rag-generator.ragExtension', async function () {
            const panel = vscode.window.createWebviewPanel(
                'chatPanel', 
                'Chat Window', 
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );

            panel.webview.html = getWebviewContent();

            panel.webview.onDidReceiveMessage(message => {
                // Handling the message with a separate async function
                handleWebviewMessage(message, panel).catch(error => {
                    console.error('Unhandled error in handleWebviewMessage:', error);
                    panel.webview.postMessage({ command: 'errorMessage', text: 'An unexpected error occurred.' });
                });
            }, undefined, context.subscriptions);
        });

        context.subscriptions.push(disposable);
    } catch (error) {
        console.error('Error setting up the chat panel:', error);
        vscode.window.showErrorMessage('Failed to setup the chat panel.');
    }
}

// Handle messages in a separate async function to properly catch errors
async function handleWebviewMessage(message, panel) {
    try {
        if (message.command === 'sendMessage') {
            const userRole = "java" //message.userrole; // Get the user role from the message
            const response = await sendMessageToAPI(message.text, userRole);

            panel.webview.postMessage({ command: 'newMessage', text: response });
        }
    } catch (error) {
        console.error('Error sending or handling message:', error);
        panel.webview.postMessage({ command: 'errorMessage', text: 'Error: Could not send or handle the message.' });
    }
}



/**
 * Returns the HTML content for the chat panel webview.
 */
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






/**
 * Sends a message to the API and returns the response.
 */
async function sendMessageToAPI(message, userRole) {
    try {
        const response = await axios.post('https://random-data-api.com/api/v2/beers', {
            messages: message,
            userRole: userRole
         });
        console.log(response);
        return response.data.answer;
    } catch (error) {
        console.error('Error sending message:', error);
        return 'Error: Could not send message.';
    }
}

exports.activate = activate;
