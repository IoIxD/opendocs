const textbox = document.getElementById('edit');
const socket = new WebSocket(`ws://${window.location.hostname}:8080/edit`);

socket.addEventListener('open', function (event) {
	// might wanna do stuff here
});

socket.addEventListener('message', function (event) {
	data = JSON.parse(event.data);
	console.log('Message from server ', data);
	if(data.type == "update") {
		ev = new Event("input", data.event);
		for (var key in data.event) {
			ev[key] = data.event[key];
		};
	
		textbox.dispatchEvent(ev)
	} else {
		console.log("Unknown event");
	}
});

changeHandler = (event) => {
	if(!event.isTrusted) return;
	var object = {};
	for (var key in event) {
		object[key] = event[key];
	};

	object["path"] = undefined;
	socket.send(JSON.stringify({type: "update", event: object}))
}

textbox.addEventListener("input", changeHandler);
// textbox.addEventListener("change", changeHandler);