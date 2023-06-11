const downloads = {
	win32: {
		'qm-vamp-plugins': {
			url: 'https://code.soundsoftware.ac.uk/attachments/download/2622/qm-vamp-plugins-1.8.0-win64.zip',
			files: [
				'qm-vamp-plugins-1.8.0-win64/qm-vamp-plugins.dll'
			]
		},
		'sonic-annotator': {
			url: 'https://code.soundsoftware.ac.uk/attachments/download/2709/sonic-annotator-1.6-win64.zip',
			files: [
				'sonic-annotator-1.6-win64\\sonic-annotator.exe',
				'sonic-annotator-1.6-win64\\libsndfile-1.dll'
			]
		},
		'ffmpeg': {
			url: 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl-shared.zip',
			files: [
				'ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe',
				'ffmpeg-master-latest-win64-gpl-shared/bin/ffprobe.exe'
			]
		}
	},
	macOs: {
		'qm-vamp-plugins': {
			url: 'https://code.soundsoftware.ac.uk/attachments/download/2620/qm-vamp-plugins-1.8.0-macos.tar.gz',
			files: [
				'qm-vamp-plugins-1.8.0-macos/qm-vamp-plugins.dylib',
				'qm-vamp-plugins-1.8.0-macos/qm-vamp-plugins.n3',
				'qm-vamp-plugins-1.8.0-macos/qm-vamp-plugins.cat'
			]
		},
		'sonic-annotator': {
			url: 'https://code.soundsoftware.ac.uk/attachments/download/2711/sonic-annotator-1.6-macos.tar.gz',
			files: [
				'sonic-annotator-1.6-macos/sonic-annotator'
			]
		},
		'ffmpeg': {
			url: 'https://evermeet.cx/ffmpeg/getrelease/zip',
			files: [
				'ffmpeg'
			]
		},
		'ffprobe': {
			url: 'https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip',
			files: [
				'ffprobe'
			]
		}
	},
	linux: {
		'qm-vamp-plugins': {
			url: 'https://code.soundsoftware.ac.uk/attachments/download/2625/qm-vamp-plugins-1.8.0-linux64.tar.gz',
			files: [
				'qm-vamp-plugins-1.8.0-linux64/qm-vamp-plugins.so'
			]
		},
		'sonic-annotator': {
			url: 'https://code.soundsoftware.ac.uk/attachments/download/2708/sonic-annotator-1.6-linux64-static.tar.gz',
			files: [
				'sonic-annotator-1.6-linux64-static/sonic-annotator'
			]
		},
		'ffmpeg': {
			url: 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl-shared.tar.xz',
			files: [
				'ffmpeg',
				'ffprobe'
			],
			stripComponents: 2
		}
	}
}

export default downloads