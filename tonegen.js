
toneGen();

function toneGen(){
	
	var audio = new (window.AudioContext || window.webkitAudioContext)();

	if(!audio){
		console.error("Coudn't initiate audio context!");
		return false;
	}

	var frequencySlider = document.getElementById("frequency");
	var volumeSlider = document.getElementById("volume");
	var muteButton = document.getElementById("mute");
	var startButton = document.getElementById("startButton");

	var muted = false;
	var playing = false;
	var frequency = 440;
	var volume = Math.pow(0.3, 2);
	var wave = "sine"

	initUi();

	var oscillator = audio.createOscillator();
	oscillator.type = wave;
	oscillator.frequency.value = frequency;
	oscillator.start();

	var gain = audio.createGain();
	if(!muted){
		gain.gain.value = volume;
	} else {
		gain.gain.value = 0;
	}

	audio.suspend();
	oscillator.connect(gain);
	gain.connect(audio.destination);

	function initUi(){

		frequencySlider.value = frequency;
		volumeSlider.value = Math.sqrt(volume);
		updateMuteButton();

		initWaveInputs();

		frequencySlider.addEventListener("input", function(e){
			frequency = this.value;
			oscillator.frequency.value = frequency;
		});

		volumeSlider.addEventListener("input", function(e){
			volume = Math.pow(this.value, 2);
			gain.gain.value = volume;
			muted = false;
			updateMuteButton();
		});

		muteButton.addEventListener("click", function(e){
			muted = !muted;
			if(muted){
				gain.gain.value = 0;
			} else {
				gain.gain.value = volume;
			}
			updateMuteButton();
		});

		startButton.addEventListener("click", function(e){
			playing = !playing;
			if(playing){
				audio.resume();
				if(!muted){
					gain.gain.value = volume;
				}
				this.className = "stop";
				this.innerHTML = "Stop";
			} else {
				gain.gain.value = 0;
				setTimeout(function(){audio.suspend();}, 100);
				// The timeout and gain=0 is to avoid a harsh popping sound on suspend
				this.className = "";
				this.innerHTML = "Start";
			}
		});

		function updateMuteButton(){
			console.log(volume);
			var volumeImg = document.getElementById("volumeImg");
			var muteImg = document.getElementById("muteImg");

			if(volume > 0.6){
				volumeImg.src = "./img/volume-full.svg";
			} else if(volume > 0.1){
				volumeImg.src = "./img/volume-med.svg";
			} else if(volume > 0){
				volumeImg.src = "./img/volume-low.svg";
			} else{
				volumeImg.src = "./img/volume-none.svg";
			}

			if(muted){
				muteImg.style.display = "block";
			} else {
				muteImg.style.display = "none";
			}
		}

		function initWaveInputs(){
			var elements = [
				 document.getElementById("wave-sine")
				,document.getElementById("wave-square")
				,document.getElementById("wave-sawtooth")
				,document.getElementById("wave-triangle")
			];

			var value = "";
			for(var i in elements){
				if(elements.hasOwnProperty(i)){
					elements[i].addEventListener("click", function(e){
						wave = this.value;
						oscillator.type = wave;
					});
				}
			}
			
		}

	}

}






























