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
        <title>Code Chat</title>
        <style>
            body {
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                margin: 0;
                padding: 20px;
                background-color: #1E1E1E; /* Dark background */
                color: #9CDCFE; /* Light text color */
            }
            h1 {
                color: #4EC9B0; /* Heading color */
            }
            #chat-container {
                background: #1E1E1E; /* Dark background for the container */
                border-radius: 5px;
                padding: 10px;
                box-shadow: 0 2px 10px 0 rgba(0,0,0,0.2);
                max-width: 800px;
                margin: 0 auto;
            }
            #messageInput {
                width: calc(100% - 90px);
                padding: 10px;
                margin-right: 10px;
                border-radius: 4px;
                border: 1px solid #3C3C3C; /* Subtle border */
                background-color: #2D2D2D; /* Slightly different background */
                color: #D4D4D4; /* Light text color */
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            }
            button {
                padding: 10px 20px;
                background-color: #007ACC; /* Button color */
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            button:hover {
                background-color: #005C99; /* Darker shade on hover */
            }
            ul {
                list-style: none;
                padding: 0;
            }
            li {
                margin: 10px 0;
                padding: 10px;
                background-color: #252526; /* Background color for each message */
                border-radius: 4px;
                color: #CCC; /* Text color for messages */
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            }
            .timestamp {
                color: #888; /* Timestamp color */
                font-size: 0.85em;
                margin-left: 10px;
            }
            .message-content {
                color: #6A9955; /* Color similar to code comments */
            }
            #messages {
                max-height: 300px;
                overflow-y: auto;
            }
        </style>
    </head>
    <body>
        <div id="chat-container">
            <h1>Chat with API</h1>
            <div id="input-area">
                <input type="text" id="messageInput" placeholder="Type a message" onkeypress="handleKeyPress(event)">
                <button onclick="sendMessage()">Send</button>
            </div>
            <ul id="messages"></ul>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            
            function handleKeyPress(event) {
                if (event.key === 'Enter') {
                    sendMessage();
                }
            }

            function sendMessage() {
                const input = document.getElementById('messageInput');
                const message = input.value;
                input.value = '';
                if (message) {
                    vscode.postMessage({
                        command: 'sendMessage',
                        text: message
                    });
                }
                input.focus();
                scrollToBottom();
            }

            function scrollToBottom() {
                const messagesContainer = document.getElementById('messages');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'newMessage':
                        const messages = document.getElementById('messages');
                        const newMessage = document.createElement('li');
                        const timestamp = document.createElement('span');
                        timestamp.className = 'timestamp';
                        timestamp.textContent = new Date().toLocaleTimeString(); // Simple timestamp
                        const messageContent = document.createElement('p');
                        messageContent.className = 'message-content';
                        messageContent.textContent = message.text;
                        newMessage.appendChild(messageContent);
                        newMessage.appendChild(timestamp);
                        messages.appendChild(newMessage);
                        scrollToBottom();
                        break;
                    case 'errorMessage':
                        // Handle error
                        break;
                }
            });
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
