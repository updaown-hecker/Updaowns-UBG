/**
 * Users System - Manages user discovery and friend requests
 * This script handles user search, display, and friend request functionality
 */

class UsersManager {
    constructor() {
        this.authToken = localStorage.getItem('authToken');
        this.users = [];
        this.currentPage = 1;
        this.usersPerPage = 10;
        this.totalUsers = 0;
        this.searchTerm = '';
    }

    /**
     * Initialize the users manager
     */
    async init() {
        if (!this.authToken) {
            console.log('User not logged in, users system disabled');
            return;
        }

        // Create and inject the users UI into the chat page
        this.createUsersUI();
        
        // Load initial users
        await this.loadUsers();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Create and inject the users UI
     */
    createUsersUI() {
        // Check if we're on the chat page
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;
        
        // Add a new tab for users
        const tabsContainer = document.querySelector('.tabs');
        if (tabsContainer) {
            const usersTab = document.createElement('div');
            usersTab.className = 'tab';
            usersTab.dataset.tab = 'users';
            usersTab.textContent = 'Users';
            tabsContainer.appendChild(usersTab);
        }
        
        // Create users list container
        const usersListContainer = document.createElement('div');
        usersListContainer.className = 'users-list';
        usersListContainer.id = 'users-list';
        usersListContainer.style.display = 'none';
        usersListContainer.innerHTML = `
            <div class="search-container">
                <input type="text" id="user-search" placeholder="Search users..." class="search-input">
                <button id="search-button" class="search-button">Search</button>
            </div>
            <div id="users-container" class="users-container"></div>
            <div class="pagination-container">
                <button id="prev-page" class="pagination-button">Previous</button>
                <span id="page-info" class="page-info">Page 1</span>
                <button id="next-page" class="pagination-button">Next</button>
            </div>
        `;
        
        // Add the users list after the friends list
        const friendsList = document.getElementById('friends-list');
        if (friendsList && friendsList.parentNode) {
            friendsList.parentNode.insertBefore(usersListContainer, friendsList.nextSibling);
        }
        
        // Add styles for the users list
        const style = document.createElement('style');
        style.textContent = `
            .users-list {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
            }
            
            .search-container {
                display: flex;
                margin-bottom: 10px;
            }
            
            .search-input {
                flex: 1;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 5px 0 0 5px;
                color: white;
                outline: none;
            }
            
            .search-button {
                background: var(--accent-color, #7289da);
                color: white;
                border: none;
                border-radius: 0 5px 5px 0;
                padding: 0 15px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .search-button:hover {
                background: #5b6eae;
            }
            
            .users-container {
                margin-bottom: 10px;
            }
            
            .user-item {
                display: flex;
                align-items: center;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 5px;
                background: rgba(255, 255, 255, 0.05);
            }
            
            .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--accent-color, #7289da);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 10px;
            }
            
            .user-info {
                flex: 1;
            }
            
            .user-name {
                font-weight: 500;
                margin-bottom: 3px;
            }
            
            .user-status {
                font-size: 0.8rem;
                opacity: 0.7;
            }
            
            .friend-button {
                background: var(--accent-color, #7289da);
                color: white;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.8rem;
            }
            
            .friend-button:hover {
                background: #5b6eae;
            }
            
            .friend-button.pending {
                background: #f0ad4e;
            }
            
            .friend-button.friends {
                background: #5cb85c;
            }
            
            .pagination-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 10px;
            }
            
            .pagination-button {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .pagination-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .pagination-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .page-info {
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Set up event listeners for the users UI
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                if (tabName === 'users') {
                    // Show users list, hide others
                    document.getElementById('users-list').style.display = 'flex';
                    document.getElementById('friends-list').style.display = 'none';
                    // Reload users
                    this.loadUsers();
                } else if (tabName === 'friends') {
                    // Show friends list, hide others
                    document.getElementById('users-list').style.display = 'none';
                    document.getElementById('friends-list').style.display = 'flex';
                }
            });
        });

        // Search button
        const searchButton = document.getElementById('search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.searchTerm = document.getElementById('user-search').value.trim();
                this.currentPage = 1;
                this.loadUsers();
            });
        }

        // Search input (search on Enter key)
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchTerm = searchInput.value.trim();
                    this.currentPage = 1;
                    this.loadUsers();
                }
            });
        }

        // Pagination buttons
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadUsers();
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const maxPage = Math.ceil(this.totalUsers / this.usersPerPage);
                if (this.currentPage < maxPage) {
                    this.currentPage++;
                    this.loadUsers();
                }
            });
        }
    }

    /**
     * Load users with pagination and search
     */
    async loadUsers() {
        if (!this.authToken) return;

        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.usersPerPage
            });
            
            if (this.searchTerm) {
                params.append('search', this.searchTerm);
            }
            
            const response = await fetch(`/api/users?${params.toString()}`, {
                headers: {
                    'x-auth-token': this.authToken
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.users = data.users;
                this.totalUsers = data.total;
                this.renderUsers();
                this.updatePagination();
            } else {
                console.error('Failed to load users:', data.message);
                // If token is invalid, try to refresh it
                if (data.message === 'Token is not valid') {
                    this.refreshAuthToken();
                }
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    /**
     * Render the users list
     */
    renderUsers() {
        const usersContainer = document.getElementById('users-container');
        if (!usersContainer) return;

        // Clear existing content
        usersContainer.innerHTML = '';

        // If no users found
        if (this.users.length === 0) {
            usersContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No users found</h3>
                    <p>Try a different search term</p>
                </div>
            `;
            return;
        }

        // Create user items
        this.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            // Get initials for avatar
            const initials = user.username.substring(0, 2).toUpperCase();
            
            // Get friend status
            const friendStatus = window.friendsManager ? 
                window.friendsManager.getFriendStatus(user._id) : 'none';
            
            // Create button text and class based on friend status
            let buttonText = 'Add Friend';
            let buttonClass = 'friend-button';
            
            if (friendStatus === 'friend') {
                buttonText = 'Friends';
                buttonClass += ' friends';
            } else if (friendStatus === 'pending') {
                buttonText = 'Pending';
                buttonClass += ' pending';
            }
            
            userItem.innerHTML = `
                <div class="user-avatar">${initials}</div>
                <div class="user-info">
                    <div class="user-name">${user.username}</div>
                    <div class="user-status">Level ${user.level || 1}</div>
                </div>
                <button class="${buttonClass}" data-user-id="${user._id}">${buttonText}</button>
            `;
            
            usersContainer.appendChild(userItem);
        });

        // Add event listeners to friend buttons
        usersContainer.querySelectorAll('.friend-button').forEach(button => {
            // Skip if already friends or pending
            if (button.classList.contains('friends') || button.classList.contains('pending')) {
                return;
            }
            
            button.addEventListener('click', async () => {
                const userId = button.dataset.userId;
                if (window.friendsManager) {
                    const success = await window.friendsManager.sendFriendRequest(userId);
                    if (success) {
                        button.textContent = 'Pending';
                        button.classList.add('pending');
                    }
                }
            });
        });
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        const pageInfo = document.getElementById('page-info');
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        
        if (!pageInfo || !prevButton || !nextButton) return;
        
        const maxPage = Math.ceil(this.totalUsers / this.usersPerPage);
        
        pageInfo.textContent = `Page ${this.currentPage} of ${maxPage}`;
        prevButton.disabled = this.currentPage <= 1;
        nextButton.disabled = this.currentPage >= maxPage;
    }

    /**
     * Refresh the authentication token
     */
    refreshAuthToken() {
        // Get the latest token from localStorage
        const freshToken = localStorage.getItem('authToken');
        
        if (freshToken && freshToken !== this.authToken) {
            console.log('Refreshing authentication token');
            this.authToken = freshToken;
            
            // Reload users with new token
            this.loadUsers();
        } else {
            console.warn('No valid authentication token available');
        }
    }
}

// Create global instance
window.usersManager = new UsersManager();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('authToken')) {
        window.usersManager.init();
    }
});