document.addEventListener("DOMContentLoaded", async () => {

    const sleep = ms => new Promise(r => setTimeout(r, ms))

    const getActiveTab = async () => {
        const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
        })
        return tabs[0]
    }
    const showPopup = async (answer) => {
        if (answer !== "CLOUDFLARE" && answer !== "ERROR") {
            try {
                let res = await answer.split("data:")
                try {
                    const detail = JSON.parse(res[0]).detail
                    document.getElementById('output').style.opacity = 1
                    document.getElementById('output').innerHTML = detail
                    return;
                } catch (e) {
                    try {
                        res = res[1].trim()
                        if (res === "[DONE]") return
                        answer = JSON.parse(res)
                        let final = answer.message.content.parts[0]
                        final = final.replace(/\n/g,'<br>')
                        document.getElementById('output').style.opacity = 1
                        document.getElementById('output').innerHTML = final
                    } catch (e) {}
                }
            } catch (e) {
                document.getElementById('output').style.opacity = 1
                document.getElementById('output').innerHTML = "Something went wrong. Please try in a few minutes."
            }

        } else if (answer === "CLOUDFLARE") {
            document.getElementById('input').style.opacity = 1
            document.getElementById('input').innerHTML = 'You need to once visit <a target="_blank" href="https://chat.openai.com/chat">chat.openai.com</a> and check if the connection is secure. Redirecting...'
            await sleep(3000)
            chrome.tabs.create({url: "https://chat.openai.com/chat"})
        } else {
            document.getElementById('output').style.opacity = 1
            document.getElementById('output').innerHTML = 'Something went wrong. Are you logged in to <a target="_blank" href="https://chat.openai.com/chat">chat.openai.com</a>? Try logging out and logging in again.'
        }
    }
    const getData = async (selection, messageType) => {
        if (!selection.length == 0) {
            document.getElementById('input').style.opacity = 1
            document.getElementById('input').innerHTML = selection
            document.getElementById('output').style.opacity = 0.5
            document.getElementById('output').innerHTML = "Loading..."
            const port = chrome.runtime.connect();
            port.postMessage({ question: selection, messageType: messageType }); // Include messageType
            port.onMessage.addListener((msg) => showPopup(msg))
        } else {
            document.getElementById('input').style.opacity = 0.5
            document.getElementById('input').innerHTML = "You have to first select some text"
        }
    }
    const getSelectedText = async (messageType) => {
        const activeTab = await getActiveTab();
        chrome.tabs.sendMessage(activeTab.id, { type: "LOAD" }, (selection) => {
            getData(selection, messageType); // Use the provided messageType parameter
        });
    };

    // Add event listeners for the buttons
    document.getElementById('summary-button').addEventListener('click', generateSummary);
    document.getElementById('major-points-button').addEventListener('click', generateMajorPoints);
    document.getElementById('copy-button').addEventListener('click', copyTextToClipboard);

    // Define the functions to generate summary and major points
    async function generateSummary() {
        const selectedText = await getSelectedText("Summary of this Content"); // Pass "summary" as messageType
    }
    
    async function generateMajorPoints() {
        const selectedText = await getSelectedText("Major Points of this Content"); // Pass "majorPoints" as messageType
    }
    async function copyTextToClipboard() {
        const outputElement = document.getElementById('output');
        const textToCopy = outputElement.innerText;
        
        // Create a temporary input element to copy text
        const tempInput = document.createElement('textarea');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        // Display a notification that text has been copied
        alert('Text copied to clipboard');
    }

});








