import WaveSurfer from 'wavesurfer.js';
import WaveSurferCursor from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.js';
import WaveSurferRegions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';
import WaveSurferTimeline from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.js';
import WaveSurferPlayhead from 'wavesurfer.js/dist/plugin/wavesurfer.playhead.js';
import * as React from 'react';
import nicejob from './nicejob.js';
const ff = require('./ff.js')
var MusicTempo = require("music-tempo");

var context = new AudioContext({ sampleRate: 44100 });

/* 
import './libs/essentia.js-0.1.3/essentia.js-core.js';
const EssentiaWASM = require('./libs/essentia.js-0.1.3/essentia-wasm.web.js');
import EssentiaWASMProcessor from './libs/essentia.js-0.1.3/main.js';
EssentiaWASMProcessor.init(EssentiaWASM)
*/

class Wav extends React.Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.togglePlayButtonRef = React.createRef();
		this.state = { playing: false }
	}

	async initializeWavesurfer() {
		const self = this
		this.wavesurfer = WaveSurfer.create({
			container: this.myRef.current,
			splitChannels: false,
			height: 300,
			plugins: [
				WaveSurferPlayhead.create({
					returnOnPause: true,
					moveOnSeek: true,
					draw: true
				}),
				WaveSurferTimeline.create({
					container: "#wave-timeline"
				}),
				WaveSurferCursor.create({
					showTime: true,
					opacity: 1,
					customShowTimeStyle: {
						'background-color': '#000',
						color: '#fff',
						padding: '2px',
						'font-size': '10px'
					}
				})/* ,
				WaveSurferRegions.create({ 
					regions: [
						{
							title: 'focus',
							start: 1.5,
							end: 3,
							loop: false,
							color: 'hsla(400, 100%, 30%, 0.5)'
						}, {
							start: 5,
							end: 7,
							loop: false,
							color: 'hsla(200, 50%, 70%, 0.4)',
							minLength: 1,
							maxLength: 5,
						}
					],

					dragSelection: {
						slop: 5
					}
				}) */
			]
		});
		// enure wavesurfer finished loading
		this.wavesurfer.on('ready', async () => {
			log.log("ready", self.f)
			const filename = self.f.path
			self.props.setFilename(filename)
		})

		this.wavesurfer.on('error', (e) => {
			log.error(e, 'try again')
			// self.props.setFilename(null)
			self.wavesurfer.destroy()
		})

		this.wavesurfer.on('destroy', (e) => {
			log.info(nicejob.bad, 'wavesurver fucked up')
			self.initializeWavesurfer()
		})

		this.wavesurfer.on('play', (e) => {
			self.setState({ playing: true })
		})

		this.wavesurfer.on('pause', (e) => {
			self.setState({ playing: false })
		})

		// https://wavesurfer-js.org/plugins/regions.html
		// https://wavesurfer-js.org/docs/events.html
		this.wavesurfer.on('interaction', (e) => {
			self.togglePlayButtonRef.current.focus()
		})
		/* this.wavesurfer.on('region-updated', (e) => {
			console.log(e)
			e.end = 8
		}) */
		this.wavesurfer.on('region-updated', function (region) {
			var regions = region.wavesurfer.regions.list;
			var keys = Object.keys(regions);
			if (keys.length > 2) {
				for (let r = 2; r < keys.length; r++) {
					const key = keys[r];
					regions[key].remove()
				}
			}
		});
	}

	componentDidMount() {
		this.initializeWavesurfer()
		if (window.__blob) {
			this.loadAudioFile(window.__blob)
		}
	}

	componentWillUnmount() {
		this.wavesurfer.destroy();
	}

	onTogglePlayButtonClick() {

		this.wavesurfer.playPause()
	}
	onZoomWav(e) {
		this.wavesurfer.zoom(Number(e.target.value));
	}

	calcTempo = function (buffer) {
		const audioData = [];
		// Take the average of the two channels
		if (buffer.numberOfChannels == 2) {
			const channel1Data = buffer.getChannelData(0);
			const channel2Data = buffer.getChannelData(1);
			const length = channel1Data.length;
			for (let i = 0; i < length; i++) {
				audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
			}
		} else {
			audioData = buffer.getChannelData(0);
		}
		const mt = new MusicTempo(audioData);
		let bpm = Math.round(mt.tempo)
		console.log(bpm)
		if (bpm === 0) {
			bpm = 120
		}
		this.props.setBPM(bpm)
		this.setState({ bpm: `${bpm} BPM` });
	}

	tryGetTime = (streams) => {
		let result = 4500
		try {
			result = parseFloat(streams[0]?.duration || '45000.00')
		} catch (e) {

		}
		return result
	}

	audioSignalExceedsLimit(audioStreams, maxLen) {
		const time = this.tryGetTime(audioStreams)
		const minutes = Math.floor(time / 60);
		const result = minutes >= maxLen
		return result
	}

	loadAudioFile = async (f) => {
		const filename = f.path
		const parms = ff.info(filename)
		const c = await myAPI.simpleExec(this.props.ffpropeApp, parms)
		const info = JSON.parse(c)
		const self = this
		const invalidChannels = info.streams.filter(s =>
			s.codec_type !== 'audio' ||
			(s.sample_rate || '').toString() !== '44100' ||
			(s.channels || '').toString() !== '2' ||
			(s.bits_per_sample || '').toString() !== '16'
		)

		const tooLongAudio = this.audioSignalExceedsLimit(info.streams, 13)

		if (tooLongAudio) {
			this.props.setFilename(filename)
			this.props.setBPM(125)
		} else {
			if (invalidChannels.length > 0) {
				window.alert("Invalid audio file. Please use 16bit 44100Hz stereo wav file.")
				// self.props.setFilename(null)
			} else {
				var reader = new FileReader();

				reader.onload = function (fileEvent) {
					context.decodeAudioData(fileEvent.target.result, self.calcTempo.bind(self));
				}

				reader.readAsArrayBuffer(f);

				window.__blob = this.f = f
				this.wavesurfer.loadBlob(f)

			}
		}
	}

	render() {
		return (
			<div>
				<input className="form-control wave-audio-signal-input" type="file" accept="audio/wav" onChange={(e) => this.loadAudioFile(e.target.files[0])} />
				<hr />
				<div className='' ref={this.myRef} />
				{/* {this.state?.bpm} */}
				<div id="wave-timeline"></div>
				<hr />

				<div className="controls">
					<div className="row">
						<div className="col-sm-2">
							<button onClick={this.onTogglePlayButtonClick.bind(this)} ref={this.togglePlayButtonRef} className="btn btn-primary" data-action="play">
								{this.state?.playing ?
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pause-btn-fill" viewBox="0 0 16 16">
										<path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm6.25-7C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5zm3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5z" />
									</svg>
									:
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
										<path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
									</svg>
								}
							</button>
						</div>

						<div className="col-sm-9">
							<input min={1} max={1000} defaultValue={1} onChange={this.onZoomWav.bind(this)} type="range" className="form-range" />
						</div>

						<div className="col-sm-1">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-zoom-out" viewBox="0 0 16 16">
								<path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
								<path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z" />
								<path fillRule="evenodd" d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default Wav;