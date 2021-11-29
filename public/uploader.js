function changeHandler({
	target
  }) {
	// Make sure we have files to use
	if (!target.files.length) return;
  
	// Create a blob that we can use as an src for our audio element
	const urlObj = URL.createObjectURL(target.files[0]);
  
	// Create an audio element
	const audio = document.createElement("audio");
	const input = document.createElement('input')
	input.type = 'text'
	input.name = 'title'
  
	// Clean up the URL Object after we are done with it
	audio.addEventListener("load", () => {
	  URL.revokeObjectURL(urlObj);
	});
  
	// Append the audio element
	document.getElementById('audioForm').appendChild(audio);

	// Allow us to control the audio
	audio.controls = "true";
  
	// Set the src and start loading the audio from the file
	audio.src = urlObj;
  }
  
  document
	.getElementById("audio-upload")
	.addEventListener("change", changeHandler);
