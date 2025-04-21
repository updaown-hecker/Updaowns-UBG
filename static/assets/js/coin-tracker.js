/**
 * Coin Tracker - Tracks gameplay time and manages coins
 * This script handles game session tracking and coin rewards
 */

class CoinTracker {
    constructor() {
        this.gameId = null;
        this.sessionStarted = false;
        this.sessionStartTime = null;
        this.sessionInterval = null;
        this.timePlayedSeconds = 0;
        this.authToken = localStorage.getItem('authToken');
        this.progressBar = null;
        this.progressText = null;
    }

    /**
     * Initialize the coin tracker for a specific game
     * @param {string} gameId - The ID of the game being played
     */
    init(gameId) {
        if (!this.authToken) {
            console.log('User not logged in, coin tracking disabled');
            return;
        }

        this.gameId = gameId;
        this.addGameExitListener();
        this.startSession();
    }

    /**
     * Start a new game session
     */
    async startSession() {
        if (!this.authToken || !this.gameId || this.sessionStarted) return;

        try {
            const response = await fetch('/api/coins/start-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': this.authToken
                },
                body: JSON.stringify({ gameId: this.gameId })
            });

            const data = await response.json();
            
            if (data.success) {
                this.sessionStarted = true;
                this.sessionStartTime = new Date();
                this.startTimeTracking();
                console.log('Game session started:', this.gameId);
            } else {
                console.error('Failed to start game session:', data.message);
            }
        } catch (error) {
            console.error('Error starting game session:', error);
        }
    }

    /**
     * End the current game session and award coins
     */
    async endSession() {
        if (!this.authToken || !this.gameId || !this.sessionStarted) return;

        try {
            const response = await fetch('/api/coins/end-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': this.authToken
                },
                body: JSON.stringify({ gameId: this.gameId })
            });

            const data = await response.json();
            
            if (data.success) {
                this.sessionStarted = false;
                this.stopTimeTracking();
                
                // Update user data in localStorage
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                if (userData && userData.coins !== undefined) {
                    userData.coins = data.totalCoins;
                    localStorage.setItem('userData', JSON.stringify(userData));
                }
                
                console.log(`Game session ended. Earned ${data.coinsEarned} coins!`);
                this.showCoinNotification(data.coinsEarned);
            } else {
                console.error('Failed to end game session:', data.message);
            }
        } catch (error) {
            console.error('Error ending game session:', error);
        }
    }

    /**
     * Start tracking gameplay time
     */
    startTimeTracking() {
        this.timePlayedSeconds = 0;
        this.progressBar = document.getElementById('coin-progress');
        this.progressText = document.getElementById('progress-text');
        
        this.sessionInterval = setInterval(() => {
            this.timePlayedSeconds++;
            
            // Update progress bar if it exists
            if (this.progressBar && this.progressText) {
                const coinInterval = 60; // Earn coins every 60 seconds
                const percentage = (this.timePlayedSeconds % coinInterval) / coinInterval * 100;
                
                this.progressBar.style.width = percentage + '%';
                this.progressText.textContent = `${this.timePlayedSeconds % coinInterval}/${coinInterval} seconds`;
                
                // When reaching the interval, reset progress bar
                if (this.timePlayedSeconds % coinInterval === 0) {
                    // Update coin display if available
                    const coinAmount = document.getElementById('coin-amount');
                    if (coinAmount) {
                        const currentCoins = parseInt(coinAmount.textContent) || 0;
                        coinAmount.textContent = currentCoins + 1;
                    }
                    
                    // Flash the progress bar
                    this.progressBar.style.transition = 'none';
                    this.progressBar.style.width = '100%';
                    this.progressBar.style.opacity = '0.8';
                    
                    setTimeout(() => {
                        this.progressBar.style.transition = 'width 0.3s ease, opacity 0.3s ease';
                        this.progressBar.style.width = '0%';
                        this.progressBar.style.opacity = '1';
                    }, 300);
                }
            }
            
            // Every 5 minutes (300 seconds), update the session to keep it alive
            if (this.timePlayedSeconds % 300 === 0) {
                console.log(`You've been playing for ${Math.floor(this.timePlayedSeconds / 60)} minutes`);
            }
        }, 1000);
    }

    /**
     * Stop tracking gameplay time
     */
    stopTimeTracking() {
        if (this.sessionInterval) {
            clearInterval(this.sessionInterval);
            this.sessionInterval = null;
        }
        
        // Reset progress bar
        if (this.progressBar && this.progressText) {
            this.progressBar.style.width = '0%';
            this.progressText.textContent = '0/60 seconds';
        }
    }

    /**
     * Add event listeners to detect when the user leaves the game
     */
    addGameExitListener() {
        // End session when user leaves the page
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
        
        // Also handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // User switched away from the game
                this.endSession();
            } else if (document.visibilityState === 'visible' && !this.sessionStarted) {
                // User came back to the game
                this.startSession();
            }
        });
    }

    /**
     * Show a notification with the coins earned
     * @param {number} coinsEarned - Number of coins earned
     */
    showCoinNotification(coinsEarned) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('coin-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'coin-notification';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.background = 'rgba(0, 0, 0, 0.8)';
            notification.style.color = '#ffd700';
            notification.style.padding = '15px 20px';
            notification.style.borderRadius = '5px';
            notification.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
            notification.style.zIndex = '1000';
            notification.style.display = 'flex';
            notification.style.alignItems = 'center';
            notification.style.transition = 'all 0.3s ease';
            notification.style.transform = 'translateY(150%)';
            document.body.appendChild(notification);
        }

        // Update notification content
        notification.innerHTML = `
            <div style="background: #ffd700; width: 24px; height: 24px; border-radius: 50%; margin-right: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #333;">$</div>
            <div>
                <div style="font-weight: bold;">+${coinsEarned} coins earned!</div>
                <div style="font-size: 12px; opacity: 0.8;">Keep playing to earn more</div>
            </div>
        `;

        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
        }, 100);

        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(150%)';
        }, 5000);
    }
}

// Create global instance
window.coinTracker = new CoinTracker();
