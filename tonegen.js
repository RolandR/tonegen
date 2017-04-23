
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
			
			var min = 1;
			var max = 24000;
			var span = max-min;
			var totalPixelsWidth = 2200;
			var exponent = 10;
			var displayWidth = 300;
			var padding = 100;

			var container = document.getElementById("gaugeContainer");

			drawFrequencyGauge(min, max, totalPixelsWidth, exponent, padding);
			updateFrequencyGauge(min, max, displayWidth, exponent, totalPixelsWidth, padding);
			
			//updateFrequencyGauge(hzPerPixel, min, max, totalPixelsWidth, exponent);
			var dragging = false;
			var startX = 0;
			var startFreq = 0;

			frequencyInput.addEventListener("input", function(e){
				if(parseFloat(this.value) >= 1){
					frequency = parseFloat(this.value);
					frequency = Math.max(Math.min(frequency, 24000), 1);
					
					updateFrequencyGauge(min, max, displayWidth, exponent, totalPixelsWidth, padding);
					oscillator.frequency.value = frequency;
				}
			});

			container.addEventListener("mousedown", function(e){
				dragging = true;
				startX = e.clientX;
				startFreq = frequency;
			});

			window.addEventListener("mousemove", function(e){
				if(dragging){
					var offset = startX - e.clientX;
					
					frequency = Math.pow(offset/totalPixelsWidth + Math.pow(startFreq/span, 1/exponent), exponent)*span;
					if(frequency > 100){
						frequency = Math.round(frequency);
					} else {
						frequency = Math.round(frequency*10)/10;
					}
					frequency = Math.min(Math.max(frequency, 1), max);
					
					updateFrequencyGauge(min, max, displayWidth, exponent, totalPixelsWidth, padding);
					oscillator.frequency.value = frequency;

					e.preventDefault();
					return false;
				}
			});

			window.addEventListener("mouseup", function(e){
				dragging = false;
			});

		}

		function drawFrequencyGauge(min, max, totalPixelsWidth, exponent, padding){
			
			var canvas = document.getElementById("frequencyGauge");
			var context = canvas.getContext("2d");

			var span = max-min;
			
			canvas.width = totalPixelsWidth + 2*padding;

			var minorLinesCount = 100;
			var linesToDraw = Math.ceil((Math.log10(max) - Math.log10(min))*minorLinesCount);

			console.log(linesToDraw);

			context.strokeStyle = "#555555";
			context.fillStyle = "#CCCCCC";
			context.textAlign = "center";
			context.textBaseline = "hanging";
			context.font = "11px monospace";

			for(var i = 0; i < linesToDraw; i++){
				var order = Math.pow(10, Math.floor(i/minorLinesCount));
				var value = order + (order) * ((i%minorLinesCount)*(exponent/minorLinesCount));

				if(value < min || value > max){
					continue;
				}

				var x = Math.pow(value/span, 1/exponent)*totalPixelsWidth+padding;
				x = ~~x+0.5;
				var y = 20;

				context.strokeStyle = "#555555";

				var firstDigit = Math.round(value*10/order);
				console.log(order, value, firstDigit);
				var five = firstDigit%5 == 0;
				var y = 5;
				if(five){
					y = 10;
					context.strokeStyle = "#777777";
				}

				if(firstDigit % 10 == 0){
					continue;
				}

				if(firstDigit >= 100){
					continue;
				}

				if(firstDigit > 50 && !five){
					continue;
				} else if(firstDigit > 50 && five){
					y = 5;
				}

				if(firstDigit == 15){
					y = 20;
					context.strokeStyle = "#AAAAAA";
					context.fillText(
						value,
						x,
						y+3
					);
				}
				
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

			}

			var majorLinesCount = 10;
			var linesToDraw = Math.ceil((Math.log10(max) - Math.log10(min))*majorLinesCount);

			console.log(linesToDraw);

			for(var i = 0; i < linesToDraw; i++){
				var order = Math.pow(10, Math.floor(i/(majorLinesCount)));
				var value = order + (order) * (i%majorLinesCount);

				if(value < min || value > max){
					continue;
				}

				var x = Math.pow(value/span, 1/exponent)*totalPixelsWidth+padding;
				x = ~~x+0.5;
				var y = 20;

				var firstDigit = Math.round(value/order);
				var even = firstDigit%2 == 0;
				var y = 20;
				if(even){
					y = 35;
				}

				if(order == value){
					context.strokeStyle = "#008800";
					context.fillStyle = "#00CC00";
					y = 35;
				} else {
					context.strokeStyle = "#AAAAAA";
					context.fillStyle = "#FFFFFF";
				}
				
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

				context.fillText(
					value,
					x,
					y+3
				);

			}
		}

		function updateFrequencyGauge(min, max, displayWidth, exponent, totalPixelsWidth, padding){
			frequencyInput.value = frequency;

			if(frequency <= 100){
				var start = frequencyInput.selectionStart;
				var end = frequencyInput.selectionEnd;
				frequencyInput.value = parseFloat(frequencyInput.value).toFixed(1);
				frequencyInput.setSelectionRange(start, end);
			}

			
			var canvas = document.getElementById("frequencyGauge");
			var span = max-min;
			
			var x = Math.pow(frequency/span, 1/exponent)*totalPixelsWidth + padding - displayWidth/2;

			x = ~~x+0.5;

			canvas.style.left = (0-x) + "px";
		}
		
	}

	function getNoteFromFrequency(freq){
		
	}

}






























