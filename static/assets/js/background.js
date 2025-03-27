// Background Handler
document.addEventListener("DOMContentLoaded", () => {
  // Load saved background settings
  const savedBackground = localStorage.getItem("backgroundSettings");
  if (savedBackground) {
    const settings = JSON.parse(savedBackground);
    applyBackground(settings);
  }
});

// Apply background function
function applyBackground(settings) {
  removeBackgroundVideo();

  if (settings.type === "video") {
    const video = document.createElement("video");
    video.id = "backgroundVideo";
    video.src = settings.url;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.style.position = "fixed";
    video.style.right = "0";
    video.style.bottom = "0";
    video.style.minWidth = "100%";
    video.style.minHeight = "100%";
    video.style.width = "auto";
    video.style.height = "auto";
    video.style.zIndex = "-1";
    video.style.objectFit = "cover";
    document.body.appendChild(video);
    document.body.style.backgroundImage = "none";
  } else {
    document.body.style.backgroundImage = `url(${settings.url})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
  }
}

// Remove background video function
function removeBackgroundVideo() {
  const existingVideo = document.getElementById("backgroundVideo");
  if (existingVideo) {
    existingVideo.remove();
  }
}
