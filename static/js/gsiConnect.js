function handleCredentialResponse(response) {
	const token = parseJwt(response.credential);
    let redirectURI = `/me/connect/google?`;
    for (let prop in token) {
        redirectURI += `${prop}=${token[prop]}&`
    }
    redirectURI.slice(0, -1);
    window.location.href = redirectURI;
}

window.onload = function () {
	google.accounts.id.initialize({
		client_id: "435964905571-03mu7j703tig7hrvvtndipuk5j2map7l.apps.googleusercontent.com",
		callback: handleCredentialResponse,
	});
	google.accounts.id.renderButton(
		document.getElementById("gsiConnect"),
		{ type: "icon", shape: "circle", theme: "outline", text: "continue_with", size: "large" } // customization attributes
	);
};