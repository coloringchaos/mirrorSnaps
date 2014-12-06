function init() {

	var videoContainer = document.getElementById('video');
	var gifContainer = document.getElementById('gifContainer');
	var videoWidth= 0, videoHeight = 0;
	var videoElement;
	var shooter;

	// add event listners
	window.addEventListener('resize', onResize);
	document.getElementById('capture').addEventListener('click', startGifCapture);


	GumHelper.startVideoStreaming(function(error, stream, videoEl, width, height) {
		if(error) {
			alert('Cannot open the camera. Make sure to allow the camera, or try refreshing the page.' + error.message);
			return;
		}

		videoElement = videoEl;
		videoElement.width = width;
		videoElement.height = height;
		videoWidth = width;
		videoHeight = height;

		videoContainer.appendChild(videoElement);

		shooter = new VideoShooter(videoElement);

		onResize();
	});


	function startGifCapture() {
		
		// 30 is the total number of frames it takes... you can change that
		// 0.2 is how often it takes a new frame .. i.e. 0.2 seconds... you can change taht
		shooter.getShot(onFrameCaptured, 10, 0.25, function onProgress(progress) {
			console.log(progress); //let's you know the current progress of the gif capture
		});

	}

	function onFrameCaptured(pictureData) {
		console.log(pictureData);

		var img = document.createElement('img');
		img.src = pictureData;
		img.id = 'generatedGif';

		var imageSize = getImageSize();

		img.style.width = imageSize[0] + 'px';
		img.style.height = imageSize[1] + 'px';

		gifContainer.insertBefore(img, gifContainer.firstChild);
	}

	function getImageSize() {
		var imageWidth = videoWidth;
		var imageHeight = videoHeight;

		return [ imageWidth, imageHeight ];
	}

	//not using this now - might be helpful later
	// function onResize(e) {

	// 	// Don't do anything until we have a video element from which to derive sizes
	// 	if(!videoElement) {
	// 		return;
	// 	}
		
	// 	var imageSize = getImageSize();
	// 	var imageWidth = imageSize[0] + 'px';
	// 	var imageHeight = imageSize[1] + 'px';

	// 	for(var i = 0; i < gifContainer.childElementCount; i++) {
	// 		var img = gifContainer.children[i];
	// 		img.style.width = imageWidth;
	// 		img.style.height = imageHeight;
	// 	}

	// 	videoElement.style.width = imageWidth;
	// 	videoElement.style.height = imageHeight;
	// }
}

window.addEventListener('DOMContentLoaded', init);
