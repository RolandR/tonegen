
toneGen();

function toneGen(){
	
	var audio = new (window.AudioContext || window.webkitAudioContext)();

	if(!audio){
		console.error("Coudn't initiate audio context!");
		return false;
	}

	var frequencyInput = document.getElementById("frequencyText");
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

		initFrequencyGauge();

		volumeSlider.value = Math.sqrt(volume);
		updateMuteButton();

		initWaveInputs();

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

		function initFrequencyGauge(){
			var hzPerPixel = 1;
			
			updateFrequencyGauge(hzPerPixel);
			var dragging = false;
			var startX = 0;
			var startFreq = 0;

			frequencyInput.addEventListener("input", function(e){
				frequency = parseFloat(this.value);
				frequency = Math.max(Math.min(frequency, 24000), 0);
				
				updateFrequencyGauge(hzPerPixel);
				oscillator.frequency.value = frequency;
			});

			frequencyGauge.addEventListener("mousedown", function(e){
				dragging = true;
				startX = e.clientX;
				startFreq = frequency;
			});

			window.addEventListener("mousemove", function(e){
				if(dragging){
					var offset = startX - e.clientX;
					
					frequency = Math.max(Math.min(startFreq + offset, 24000), 0);
					updateFrequencyGauge(hzPerPixel);
					oscillator.frequency.value = frequency;

					e.preventDefault();
					return false;
				}
			});

			window.addEventListener("mouseup", function(e){
				dragging = false;
			});

		}

		function updateFrequencyGauge(hzPerPixel){

			frequencyInput.value = frequency;
			
			var gauge = document.getElementById("frequencyGauge");
			var context = gauge.getContext("2d");

			context.clearRect(0, 0, gauge.width, gauge.height);
			
			var majorLinesEvery = 25;
			var minorLinesEvery = 5;

			context.lineWidth = 1;
			context.strokeStyle = "#555555";

			var lowest = frequency - (gauge.width/2)*hzPerPixel;
			var highest = frequency + (gauge.width/2)*hzPerPixel;
			var span = highest-lowest;

			var lowestLabel = Math.floor(lowest/majorLinesEvery)*majorLinesEvery;
			//console.log(lowestLabel);

			//console.log(lowest, highest, span);
			
			//var minorLinesEvery = hzPerPixel/2;

			for(var i = 0; i <= span/minorLinesEvery + majorLinesEvery/minorLinesEvery; i++){

				var freq = lowestLabel + i*(minorLinesEvery);

				if(freq < 0 || freq > 24000){
					continue;
				}
				
				var x = ~~((freq-frequency)/hzPerPixel + gauge.width/2)+0.5;

				//console.log(i, freq, x);
				
				context.beginPath();
				context.moveTo(
					x,
					0
				);
				context.lineTo(
					x,
					15
				);
				context.stroke();
				
			}

			context.strokeStyle = "#777777";
			context.fillStyle = "#CCCCCC";

			context.textAlign = "center";
			context.textBaseline = "hanging";
			context.font = "10px monospace";

			for(var i = 0; i <= span/majorLinesEvery + 1; i++){

				var y = 20;

				var freq = lowestLabel + i*(majorLinesEvery);

				//console.log(freq);

				if(freq%(2*majorLinesEvery) == 0){
					y = 35;
				}

				if(freq < 0 || freq > 24000){
					continue;
				}
				
				var x = ~~((freq-frequency)/hzPerPixel + gauge.width/2)+0.5;

				//console.log(i, freq, x);
				
				context.beginPath();
				context.moveTo(
					x,
					0
				);
				context.lineTo(
					x,
					y
				);
				context.stroke();

				var freqText = freq;
				if(freq >= 100000){
					freqText = Math.round(freq/1000);
					freqText += "k";
				} else if(freq >= 10000){
					freqText = Math.round(freq/100)/10;
					freqText += "k";
				} else if(freq >= 1000){
					freqText = Math.round(freq/10)/100;
					freqText += "k";
				}

				context.fillText(
					freqText,
					x-1,
					y+3
				);
				
			}

			context.beginPath();
			context.moveTo(
				~~(gauge.width/2)+0.5,
				0
			);
			context.lineTo(
				~~(gauge.width/2)+0.5,
				gauge.height
			);
			context.lineWidth = 1;
			context.strokeStyle = "#00FF00";
			context.stroke();
		}

	}

	function getNoteFromFrequency(freq){
		
	}

}






























