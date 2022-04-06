document.querySelector("#search h2").addEventListener("click", () => {
    document.querySelector("#search form").classList.toggle("active");
    const iconClassList = document.querySelector("#search h2 i").classList;
    if (iconClassList.contains("bi-caret-down-fill")) iconClassList.replace("bi-caret-down-fill", "bi-caret-up-fill");
    else if (iconClassList.contains("bi-caret-up-fill")) iconClassList.replace("bi-caret-up-fill", "bi-caret-down-fill");
});

document.querySelector("input[type=submit]").addEventListener("click", (event) => {
    event.preventDefault();
    const videoSearchFormData = new FormData(document.querySelector('#search form'));
    searchVideos({ keywords:videoSearchFormData.get('keywords') })
    .then(response => {
        if (response.error) {
            document.querySelector("p#error").innerHTML = response.error;
            setTimeout(() => {
                document.querySelector("p#error").innerHTML = '';
            }, 10000);
        } else if (response.videos.length === 0) {
            document.querySelector("p#error").innerHTML = 'No videos match your parameters';
        } else {
            renderVideoSection(response.videos.reverse());
        }
    });
});

const searchVideos = async (data) => {
    const response = await fetch(`/learn/search?keywords=${data.keywords}`);
    return response.json();
}

const renderVideoSection = (videos) => {
    const videoSectionHTMLContent = [];
    videos.forEach(video => {
        videoElement = `
                <a class="video" href="/learn/${video.id}">
                    <video src=${video.video} title=${video.title} alt=${video.title}></video>
                    <div class="text">
                        <h3>${video.title}</h3>
                        <p class="description">${video.description.split("\n")[0]}</p>
                    </div>
                </a>
            `
        videoSectionHTMLContent.push(videoElement);
    });
    document.querySelector("#videos").innerHTML = videoSectionHTMLContent.join("");
}