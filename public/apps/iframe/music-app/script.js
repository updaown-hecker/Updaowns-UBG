const songListElement = document.getElementById('song-list');
        const fileInput = document.getElementById('file-input');
        const uploadButton = document.getElementById('upload-button');
        const deleteSelectedButton = document.getElementById('delete-selected-button');
        const playButton = document.getElementById('play-button');
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        const shuffleButton = document.getElementById('shuffle-button');
        const currentSongTitle = document.getElementById('current-song-title');
        const currentArtistName = document.getElementById('current-artist-name');
        const currentAlbumCover = document.getElementById('current-album-cover');
        const currentTimeElement = document.getElementById('current-time');
        const totalTimeElement = document.getElementById('total-time');
        const progressBar = document.getElementById('progress-bar');
        const progressContainer = document.getElementById('progress-container');
        const playlistListElement = document.getElementById('playlist-list');
        const newPlaylistNameInput = document.getElementById('new-playlist-name');
        const createPlaylistButton = document.getElementById('create-playlist-button');
        const sortTitleButton = document.getElementById('sort-title-button');
        const sortArtistButton = document.getElementById('sort-artist-button');

        let audio = new Audio();
        let currentSongIndex = 0;
        let isShuffle = false;
        let playlists = JSON.parse(localStorage.getItem('playlists')) || {};
        let currentPlaylist = 'default';
        if (!playlists[currentPlaylist]) {
            playlists[currentPlaylist] = [];
        }

        function updateSongList() {
            songListElement.innerHTML = ''; // Clear current song list
            playlists[currentPlaylist].forEach((song, index) => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between py-2 border-b border-gray-700';
        
                // Add song number, song title, artist, and image to the list item
                li.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <input type="checkbox" class="select-song-checkbox" data-index="${index}">
                        <span class="song-number font-bold mr-2">${index + 1}.</span> <!-- Song number -->
                        <img alt="Album cover of the song" class="w-12 h-12 rounded-lg" src="image.png" />
                        <div>
                            <p class="font-bold">${song.title}</p>
                            <p class="text-gray-400 text-sm">${song.artist}</p>
                        </div>
                    </div>
                    <div class="flex space-x-4">
                        <button class="text-gray-400 hover:text-white play-song-button" data-index="${index}"><i class="fas fa-play"></i></button>
                        <button class="text-gray-400 hover:text-white remove-song-button" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                // Append the song item to the list
                songListElement.appendChild(li);
            });
        
            // Add event listeners for play and remove buttons
            document.querySelectorAll('.play-song-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    currentSongIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                    playSong();
                });
            });
        
            document.querySelectorAll('.remove-song-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.getAttribute('data-index'));
                    playlists[currentPlaylist].splice(index, 1);
                    localStorage.setItem('playlists', JSON.stringify(playlists));
                    updateSongList();
                });
            });
        
            // Display current song details if available
            if (playlists[currentPlaylist].length > 0) {
                displaySong(playlists[currentPlaylist][currentSongIndex]);
            } else {
                displayDefaultMessage();
            }
        }        

        function updatePlaylistList() {
    playlistListElement.innerHTML = '';
    Object.keys(playlists).forEach(playlist => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between py-2 border-b border-gray-700';
        li.innerHTML = `
            <div class="flex items-center space-x-4">
                <p class="font-bold">${playlist}</p>
            </div>
            <div class="flex space-x-4">
                <button class="text-gray-400 hover:text-white select-playlist-button" data-playlist="${playlist}"><i class="fas fa-music"></i></button>
                <button class="text-red-500 hover:text-white delete-playlist-button" data-playlist="${playlist}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        playlistListElement.appendChild(li);
    });

    document.querySelectorAll('.select-playlist-button').forEach(button => {
        button.addEventListener('click', (e) => {
            currentPlaylist = e.currentTarget.getAttribute('data-playlist');
            currentSongIndex = 0;
            updateSongList();
        });
    });

    document.querySelectorAll('.delete-playlist-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const playlistName = e.currentTarget.getAttribute('data-playlist');

        // Prevent deletion if there's only one playlist
        if (Object.keys(playlists).length === 1) {
            // Show the popup with fade-in effect
            const popup = document.getElementById('delete-warning-popup');
            popup.classList.add('show');

            // Fade-out the popup after 1.5 seconds
            setTimeout(() => {
                popup.classList.remove('show');
            }, 1500); // 1.5 seconds delay before fading out

            return;
        }

        delete playlists[playlistName];
        localStorage.setItem('playlists', JSON.stringify(playlists));
        updatePlaylistList();

        // If the deleted playlist was the current one, switch to the default playlist
        if (currentPlaylist === playlistName) {
            currentPlaylist = 'default'; // Switch to default if the deleted playlist was the current one
            updateSongList();
        }
    });
});

// Close the popup when the close button is clicked
document.getElementById('popup-close').addEventListener('click', () => {
    const popup = document.getElementById('delete-warning-popup');
    popup.classList.remove('show');
});
}

        function playSong() {
            const song = playlists[currentPlaylist][currentSongIndex];
            audio.src = song.url;
            audio.play();
            displaySong(song);
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
        }

        function displaySong(song) {
            currentSongTitle.textContent = song.title;
            currentArtistName.textContent = song.artist;
            currentAlbumCover.src = 'image.png';
            totalTimeElement.textContent = formatTime(audio.duration);
        }

        function displayDefaultMessage() {
            currentSongTitle.textContent = 'Pick a song';
            currentArtistName.textContent = 'Artist Name';
            currentAlbumCover.src = 'image.png';
            currentTimeElement.textContent = '0:00';
            totalTimeElement.textContent = '0:00';
            progressBar.style.width = '0%';
        }

        function updateProgress() {
            const currentTime = audio.currentTime;
            const duration = audio.duration;
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            currentTimeElement.textContent = formatTime(currentTime);
            totalTimeElement.textContent = formatTime(duration);
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }

        function getNextSongIndex() {
            if (isShuffle) {
                return Math.floor(Math.random() * playlists[currentPlaylist].length);
            } else {
                return (currentSongIndex + 1) % playlists[currentPlaylist].length;
            }
        }

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', () => {
            currentSongIndex = getNextSongIndex();
            playSong();
        });

        playButton.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playButton.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                audio.pause();
                playButton.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        prevButton.addEventListener('click', () => {
            currentSongIndex = (currentSongIndex - 1 + playlists[currentPlaylist].length) % playlists[currentPlaylist].length;
            playSong();
        });

        nextButton.addEventListener('click', () => {
            currentSongIndex = getNextSongIndex();
            playSong();
        });

        shuffleButton.addEventListener('click', () => {
            isShuffle = !isShuffle;
            shuffleButton.classList.toggle('text-blue-500', isShuffle);
        });

        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            for (let file of files) {
                const url = URL.createObjectURL(file);
                const title = file.name.replace('.mp3', '');
                const artist = 'Unknown Artist';
                playlists[currentPlaylist].push({ title, artist, url });
            }
            localStorage.setItem('playlists', JSON.stringify(playlists));
            currentSongIndex = 0;
            updateSongList();
        });

        createPlaylistButton.addEventListener('click', () => {
    const newPlaylistName = newPlaylistNameInput.value.trim();
    if (newPlaylistName && !playlists[newPlaylistName]) {
        playlists[newPlaylistName] = [];
        localStorage.setItem('playlists', JSON.stringify(playlists));
        updatePlaylistList();
        newPlaylistNameInput.value = '';
    } else if (playlists[newPlaylistName]) {
        alert('Playlist already exists!');
    }
});

        progressContainer.addEventListener('click', (e) => {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        });

        progressContainer.addEventListener('mousedown', (e) => {
            const onMouseMove = (e) => {
                const width = progressContainer.clientWidth;
                const clickX = e.offsetX;
                const duration = audio.duration;
                audio.currentTime = (clickX / width) * duration;
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        sortTitleButton.addEventListener('click', () => {
            playlists[currentPlaylist].sort((a, b) => a.title.localeCompare(b.title));
            localStorage.setItem('playlists', JSON.stringify(playlists));
            updateSongList();
        });

        sortArtistButton.addEventListener('click', () => {
            playlists[currentPlaylist].sort((a, b) => a.artist.localeCompare(b.artist));
            localStorage.setItem('playlists', JSON.stringify(playlists));
            updateSongList();
        });

        deleteSelectedButton.addEventListener('click', () => {
            const selectedCheckboxes = document.querySelectorAll('.select-song-checkbox:checked');
            const indicesToDelete = Array.from(selectedCheckboxes).map(checkbox => parseInt(checkbox.getAttribute('data-index')));
            playlists[currentPlaylist] = playlists[currentPlaylist].filter((_, index) => !indicesToDelete.includes(index));
            localStorage.setItem('playlists', JSON.stringify(playlists));
            updateSongList();
        });

        updatePlaylistList();
        updateSongList();