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
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat Window</title>
        <style>
            #messages { 
                list-style-type: none; 
                padding: 0; 
            }
            li { 
                margin-bottom: 10px; 
            }
        </style>
    </head>
    <body>
        <h1>Chat with API</h1>
        <ul id="messages"></ul>
        <input type="text" id="messageInput" placeholder="Type a message">
        <button onclick="sendMessage()">Send</button>

        <script>
            const vscode = acquireVsCodeApi();
            function sendMessage() {
                const input = document.getElementById('messageInput');
                const message = input.value;
                addMessageToChat('You', message);
                vscode.postMessage({
                    command: 'sendMessage',
                    text: message
                });
                input.value = '';
            }

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'newMessage') {
                    addMessageToChat('API', message.text);
                }
            });

            function addMessageToChat(sender, text) {
                const messages = document.getElementById('messages');
                const newMessage = document.createElement('li');
                newMessage.textContent = sender + ': ' + text;
                messages.appendChild(newMessage);
                messages.scrollTop = messages.scrollHeight; // Scroll to bottom
            }
        </script>
    </body>
    </html>`;
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
