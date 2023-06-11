/*
order
Set filter order for each band split. This controls filter roll-off or steepness of filter transfer function. Available values are:

‘2nd’
12 dB per octave.

‘4th’
24 dB per octave.

‘6th’
36 dB per octave.

‘8th’
48 dB per octave.

‘10th’
60 dB per octave.

‘12th’
72 dB per octave.

‘14th’
84 dB per octave.

‘16th’
96 dB per octave.

‘18th’
108 dB per octave.

‘20th’
120 dB per octave.
*/
// ffmpeg -i demo_mastered.wav -filter_complex "acrossover=split=1500 2500 5000:order=8th[LOW][MID][HIGH][HH]" -map "[LOW]" low.wav -map "[MID]" mid.wav -map "[HIGH]" high.wav -map "[HH]" hh.wav
// instancitate array of length numberOfBands in es6 with index as value
// ffprobe -f lavfi -i amovie="test_tone.wav",astats=metadata=1:reset=1 -show_entries frame_tags=lavfi.astats.Overall.Max_level -of csv=p=0 > test.csv && drawio --title measurement --width 2048 --inputfile c:\Users\steph\Desktop\test.csv
// # drawio --title measurement --width 2048 --inputfile c:\temp\foo.csv --outfile foo.png

function probe(filename) {
	// ffprobe -f lavfi -i amovie="test_tone.wav",astats=metadata=1:reset=1 -show_entries frame_tags=lavfi.astats.Overall.Max_level -of csv=p=0 
	const fn = filename.replace(/\\/g, '\\\\');
	const result = [
		'-f', 'lavfi',
		'-i', `amovie=${fn},astats=metadata=1:reset=1`,
		'-show_entries', 'frame_tags=lavfi.astats.Overall.Max_level',
		'-of', 'csv=p=0'
	]
	return result;
}

function mpeg(audioFilename, outputFolder, numberOfBands, hash) {
	if (numberOfBands > 16) {
		throw new Error("Too many bands. Max 16 allowed.");
	}
	const order = "20th"
	const fq = 44100 / 2
	const bandWidth = fq / numberOfBands / 10;

	log.log(`${bandWidth}hz`);
	const bands = [];
	let frequency = 0;
	// sktip the first bands
	// frequency = frequency + (bandWidth * 1);
	// console.dir("band");
	for (let band = 0; band < numberOfBands - 1; band++) {
		frequency = frequency + bandWidth;
		bands.push(Math.round(frequency));
		// console.dir(band);
	}
	// console.dir(bands)
	const nameList = Array.from({ length: numberOfBands }, (v, i) => `[BAND${i}]`);
	const map = Array.from({ length: numberOfBands }, (v, i) => [`-map`, `[BAND${i}]`, window.myAPI.pathJoin([outputFolder, `${hash}_BAND_${i}.wav`])]);

	// console.dir(map.join(' '));


	// let cmd = `ffmpeg -y -i demo_mastered.wav -filter_complex "acrossover=split=${bands.join(' ')}:order=${order}${nameList.join('')}" ${map.join(' ')}`

	const res = [
		'-y', // overwrite existing files
		// '-n', // no overwrite existing files (skip) 
		'-i', audioFilename, '-filter_complex', `acrossover=split=${bands.join(' ')}:order=${order}${nameList.join('')}`, ...map.flat()]

	return res
}

function info(filename) {
	// ffprobe -v quiet -print_format json -show_format -show_streams test_tone_short.wav
	const result = [
		'-v', 'quiet',
		'-print_format', 'json',
		'-show_format',
		'-show_streams',
		filename
	]
	return result
}


function sonic_annotator_barbeattracker_transform_script(bpm) {
	const result = `@prefix xsd:      <http://www.w3.org/2001/XMLSchema#> .
@prefix vamp:     <http://purl.org/ontology/vamp/> .
@prefix :         <#> .

:transform_plugin a vamp:Plugin ;
    vamp:identifier "qm-barbeattracker" .

:transform_library a vamp:PluginLibrary ;
    vamp:identifier "qm-vamp-plugins" ;
    vamp:available_plugin :transform_plugin .

:transform a vamp:Transform ;
    vamp:plugin :transform_plugin ;
    vamp:step_size "512"^^xsd:int ; 
    vamp:block_size "1024"^^xsd:int ; 
    vamp:plugin_version """3""" ; 
    vamp:parameter_binding [
        vamp:parameter [ vamp:identifier "alpha" ] ;
        vamp:value "0.9"^^xsd:float ;
    ] ;
    vamp:parameter_binding [
        vamp:parameter [ vamp:identifier "bpb" ] ;
        vamp:value "4"^^xsd:float ;
    ] ;
    vamp:parameter_binding [
        vamp:parameter [ vamp:identifier "constraintempo" ] ;
        vamp:value "1"^^xsd:float ;
    ] ;
    vamp:parameter_binding [
        vamp:parameter [ vamp:identifier "inputtempo" ] ;
        vamp:value "${bpm}"^^xsd:float ;
    ] ;
    .`
	return result;
}
function sonic_annotator(filename, barbeattrackerTranformFilename) {
	// sonic-annotator -d vamp:qm-vamp-plugins:qm-barbeattracker -d vamp:qm-vamp-plugins:qm-segmenter:segmentation -w csv "c:\Users\steph\Desktop\test\ELEKTRON.noise - Pitch Bull - 01 Pitch Bull.wav" --csv-force
	// sonic-annotator -t c:\git\sonicsoundpicture\beats.txt -d vamp:qm-vamp-plugins:qm-segmenter:segmentation -w csv "c:\Users\steph\Desktop\test\ELEKTRON.noise - Pitch Bull - 01 Pitch Bull.wav" --csv-force
	const result = [
		// '-tsss', barbeattrackerTranformFilename,
		'-d', 'vamp:qm-vamp-plugins:qm-barbeattracker',
		'-d', 'vamp:qm-vamp-plugins:qm-segmenter:segmentation',
		'-w', 'csv',
		filename,
		'--csv-force'
	]
	return result
}

module.exports = { mpeg, probe, info, sonic_annotator, sonic_annotator_barbeattracker_transform_script }

// splitAudio('c:\\temp\\demo_mastered.wav')