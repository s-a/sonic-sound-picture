import bpy
import json
import argparse
import os 
import sys 
import wave
import time 
import csv
import re
 
bpy.app.background

def str2bool(v):
  return v.lower() in ("yes", "true", "1")

def params():
	argv = sys.argv
	argv = argv[argv.index("--") + 1:]  # get all args after "--"
	# print (argv) 

	parser = argparse.ArgumentParser(description='Blender python script extra parameters.')
	parser.add_argument('--input', help='input audio file without extenstion', required=False, default=None )
	parser.add_argument('--output_filename', help='out file without extenstion', required=False, default=None )
	parser.add_argument('--working_directory', help='working directoy of the process', required=False, default=None )
	parser.add_argument('--session_id', help='session id', required=False, default=None )
	parser.add_argument('--output_type', help='output only infos', required=False, default="info" )
	parser.add_argument('--output_frames', help='number of frames for ouput', required=False, default=-1 )
	parser.add_argument('--output_resolution', help='resolution for ouput', required=False, default=100 )
	parser.add_argument('--output_using_compositor_node', help='resolution for ouput', required=False, default="True" )
	parser.add_argument('--output_transparent', help='resolution for ouput', required=False, default="False" )
	parser.add_argument('--output_fps', help='resolution for ouput', required=False, default=30 )
	parser.add_argument('--output_resolution_x', help='resolution for ouput', required=False, default=1280 )
	parser.add_argument('--output_resolution_y', help='resolution for ouput', required=False, default=1080 )

	return parser.parse_args(argv)

args = params()

class TimeAnalytics:
	def __init__(self):
		self.start_time = None
		self.elapsed_time = 0
	
	def step(self, step_name):
		if self.start_time is not None:
			self.elapsed_time += time.time() - self.start_time
			print(str(self.elapsed_time) + " Previous step completed in %.2f seconds" % (time.time() - self.start_time))
		
		self.start_time = time.time()
		print("Starting step: %s" % step_name)
	
	def stop(self):
		if self.start_time is not None:
			self.elapsed_time += time.time() - self.start_time
			self.start_time = None
			print("Total elapsed time for all steps: %.2f seconds" % self.elapsed_time)
		else:
			print("No step was started")

time_analytics = TimeAnalytics()

class AudioSpectrum:
	def __init__(self, audio_wav_filename):
		self.audio_wav_filename = audio_wav_filename

		# Initialize the mono_signal property to an empty list
		self.mono_signal = []
		
		self.lowest_frequency = 1
		self.highest_frequency = 22050-1  
			
	def open_audio_wav_file(self):
		# Check if the WAV file exists
		if not os.path.exists(self.audio_wav_filename):
			raise Exception("Error: WAV file '%s' does not exist" % self.audio_wav_filename)
		else:
			with wave.open(self.audio_wav_filename, 'r') as f:
				# Check the format of the audio file
				if f.getsampwidth() != 2 or f.getcomptype() != 'NONE':
					f.close()
					# Handle the error here
					raise Exception("Error: Unsupported audio format")
				else:     
					# Get the number of frames and the frame rate
					self.num_frames = f.getnframes()
					self.sample_rate = f.getframerate()

					# Calculate the frame rate of the audio file in frames per second
					self.frame_rate = self.sample_rate * (1 / bpy.context.scene.render.fps)

					# Calculate the length of the audio file in seconds
					self.audio_length_secs = self.num_frames / self.sample_rate
 
					f.close()
	 
	def get_video_frame_count(self, fps):
		# Convert the length of the audio file to an integer
		audio_length_in_video_frames = int(self.audio_length_secs * fps)

		return audio_length_in_video_frames

class SceneController:
	def __init__(self, audio_wav_filename):
		self.audio_wav_filename = audio_wav_filename 
		
	def srgb_to_linearrgb(self, c):
		if   c < 0:       return 0
		elif c < 0.04045: return c/12.92
		else:             return ((c+0.055)/1.055)**2.4

	def hex_to_rgba( self, hex_value ):
		hex_color = hex_value[1:]

		r = int(hex_color[:2], base=16)
		sr = r / 255.0
		lr = self.srgb_to_linearrgb(sr)
		
		g = int(hex_color[2:4], base=16)
		sg = g / 255.0
		lg = self.srgb_to_linearrgb(sg)
		
		b = int(hex_color[4:6], base=16)
		sb = b / 255.0
		lb = self.srgb_to_linearrgb(sb)
		
		result = [lr, lg, lb, 1.0]
		return tuple(result)

	def reset_audio(self, audio_wav_filename):
		bpy.context.scene.render.ffmpeg.audio_codec = 'AAC'
		bpy.context.scene.render.ffmpeg.audio_channels = 'STEREO'
		bpy.context.scene.render.ffmpeg.audio_mixrate = 44100
		bpy.context.scene.render.ffmpeg.audio_bitrate = 384
		bpy.context.scene.render.ffmpeg.audio_volume = 1

		# verify if the audio file exists
		if not os.path.exists(audio_wav_filename):
			raise Exception("Error: WAV file '%s' does not exist" % audio_wav_filename)

		# Remove all strips from the sequence editor
		for strip in bpy.context.scene.sequence_editor.sequences:
			bpy.context.scene.sequence_editor.sequences.remove(strip)

		# Add a new sound strip using the name of the sound
		bpy.context.scene.sequence_editor.sequences.new_sound(
			name = "song",
			filepath = audio_wav_filename, 
			frame_start = 1,
			channel = 1
		)
	
	def is_path_valid(self, tar, data_path):
		try:
			obj = tar
			path = data_path.split('.')
			for p in path:
				if p.startswith('['):
					# p is a list index, so extract the index value
					index = int(p[1:-1])
					obj = obj[index]
				else:
					# p is an attribute, so access it directly
					obj = getattr(obj, p)
			return True
		except (IndexError, AttributeError):
			return False

	def is_property_path_valid(self, tar, data_path):
		if not tar.has_property(data_path):
			return False
		return True
		
	def create_fcurve_ex(self, property_name):
		fcurve = None
		data_path = '["' + property_name + '"]'

		# verify if the host object exists
		if "SONIC_SOUND_PICTURE_DATA_STORAGE" not in bpy.data.objects:
			raise Exception("Error: Host object '%s' does not exist. Ensure it is in top level of scene." % "SONIC_SOUND_PICTURE_DATA_STORAGE")

		obj = bpy.data.objects["SONIC_SOUND_PICTURE_DATA_STORAGE"]
		# Check if the object has an AnimationData data block
		if obj.animation_data is None:
			# Create an AnimationData data block for the object if it does not already exist
			obj.animation_data_create()
			action = bpy.data.actions.new(name=obj.name + "_ACTIONS")
		else:
			# Get the action for the object
			action = obj.animation_data.action

		# Check if the host object has the property
		if property_name not in obj.keys():
			raise Exception("Error: Host object '%s' does not have property '%s'" % (obj.name, property_name))
			
		fcurve = action.fcurves.new(
			data_path = data_path,
			index = 0
		)

		obj.animation_data.action = action 
		return fcurve

	def get_frame_number_of_seconds(self, seconds):
		return int(seconds * bpy.context.scene.render.fps)

	def reset_info_key_frames(self):
		# verify if the host object exists
		if "SONIC_SOUND_PICTURE_DATA_STORAGE" not in bpy.data.objects:
			raise Exception("Error: Host object '%s' does not exist. Ensure it is in top level of scene." % "SONIC_SOUND_PICTURE_DATA_STORAGE")

		obj = bpy.data.objects["SONIC_SOUND_PICTURE_DATA_STORAGE"]
		# clear animation data
		obj.animation_data_clear()

	def get_requires_frequency_bands(self):
		result = 0
		# verify if the host object exists
		if "SONIC_SOUND_PICTURE_DATA_STORAGE" not in bpy.data.objects:
			raise Exception("Error: Host object '%s' does not exist. Ensure it is in top level of scene." % "SONIC_SOUND_PICTURE_DATA_STORAGE")

		obj = bpy.data.objects["SONIC_SOUND_PICTURE_DATA_STORAGE"]
		# list all custom properties starting with "song_frequency_band_"
		for key in obj.keys():
			if key.startswith("song_frequency_band_"):
				result = result + 1

		return result

	def set_info(self, property_name, value):
		# verify if the host object exists
		if "SONIC_SOUND_PICTURE_DATA_STORAGE" not in bpy.data.objects:
			raise Exception("Error: Host object '%s' does not exist. Ensure it is in top level of scene." % "SONIC_SOUND_PICTURE_DATA_STORAGE")

		obj = bpy.data.objects["SONIC_SOUND_PICTURE_DATA_STORAGE"]

		# Check if the host object has the property
		if property_name not in obj.keys():
			raise Exception("Error: Host object '%s' does not have property '%s'" % (obj.name, property_name))

		obj[property_name] = value


	def write_song_section_detection_info_key_frames(self, json_data):
		fcurve = self.create_fcurve_ex('song_section_id')
		for i in range(len(json_data["sections"])):
			section = json_data["sections"][i]
			id = int(section["id"])
			seconds = int(section["start"])
			frameNumber = self.get_frame_number_of_seconds(seconds)
			keyframe = fcurve.keyframe_points.insert(frameNumber, value=id, options={'FAST'})
			keyframe.interpolation = 'CONSTANT'

	def write_beat_detection_info_key_frames(self, json_data):
		fcurve = self.create_fcurve_ex('song_beat_id')
		for i in range(len(json_data["beats"])):
			section = json_data["beats"][i]
			id = int(section["id"])
			seconds = int(section["start"])
			frameNumber = self.get_frame_number_of_seconds(seconds)
			keyframe = fcurve.keyframe_points.insert(frameNumber, value=id, options={'FAST'})
			keyframe.interpolation = 'CONSTANT'

	def write_beat_impulse_info_key_frames(self, json_data):
		fcurve = self.create_fcurve_ex('song_impulse')
		for i in range(len(json_data["beats"])):
			section = json_data["beats"][i]
			id = int(section["id"])
			seconds = int(section["start"])
			frameNumber = self.get_frame_number_of_seconds(seconds)
			keyframe = fcurve.keyframe_points.insert(frameNumber - 1, value=0, options={'FAST'})
			keyframe.interpolation = 'BEZIER'
			keyframe = fcurve.keyframe_points.insert(frameNumber, value=1, options={'FAST'})
			keyframe.interpolation = 'BEZIER'

	def write_song_progress_info_key_frames(self):
		fcurve = self.create_fcurve_ex('song_progress')
		keyframe = fcurve.keyframe_points.insert(0, value=0, options={'FAST'})
		keyframe.interpolation = 'LINEAR'
		keyframe = fcurve.keyframe_points.insert(bpy.context.scene.frame_end, value=1, options={'FAST'})
		keyframe.interpolation = 'LINEAR'

	def write_frequency_band_info_key_frames(self, index, frequency_scale_max):
		i = str(index)
		idx = i
		# ensure idx is 2 digits and prefix with 0 if not
		if len(idx) == 1:
			idx = "0" + idx

		fcurve = self.create_fcurve_ex('song_frequency_band_' + idx)
		csv_filename = fn('_BAND_' + i + '.csv')
		analytic_signal = None
		target_frame_count = bpy.context.scene.frame_end

		with open(csv_filename, 'r') as csvfile:
			reader = csv.DictReader(csvfile)
			analytic_signal = [float(row[key]) for row in reader for key in row]
		
		decimal_places = 3
		max_value = max(analytic_signal)
		prev_amp = -1
		
		factor = len(analytic_signal) / target_frame_count
		for frame in range(target_frame_count):
			sniper = int(frame * factor)
			# Get the amplitude at the current frame
			amp = analytic_signal[sniper]

			# Scale the amplitude value to the range 0-2
			if (max_value > 0):
				amp = round((amp / max_value) * frequency_scale_max, decimal_places)
			else:
				amp = 0

			if amp != prev_amp:
				# Insert the scaled amplitude value as a keyframe
				fcurve.keyframe_points.insert(frame, value=amp, options={'FAST'})    
				prev_amp = amp

		# 0 value at the end
		fcurve.keyframe_points.insert(target_frame_count, value=0, options={'FAST'})
		fcurve.keyframe_points.insert(target_frame_count+1, value=0, options={'FAST'})

	def write_key_frames(self, analytic_signal, fcurve, target_frame_count):
		decimal_places = 3

		max_value = max(analytic_signal)
		prev_amp = -1
		
		factor = len(analytic_signal) / target_frame_count
		for frame in range(target_frame_count):
			sniper = int(frame * factor)
			# Get the amplitude at the current frame
			amp = analytic_signal[sniper]

			# Scale the amplitude value to the range 0-2
			if max_value > 0:
				amp = round((amp / max_value) * 1.8, decimal_places)
			else:
				amp = 0
				
			if amp != prev_amp:
				# Insert the scaled amplitude value as a keyframe
				fcurve.keyframe_points.insert(frame, value=amp, options={'FAST'})    
				prev_amp = amp
		# 0 value at the end
		fcurve.keyframe_points.insert(target_frame_count, value=0, options={'FAST'})
		fcurve.keyframe_points.insert(target_frame_count+1, value=0, options={'FAST'})

class ConfigController:
	def get_object(self, key):
		# Use a regular expression to split the key on the period character, except when it's inside square brackets
		parts = re.split(r'(?<!\[)\.(?![^\[]*\])', key)

		# Skip the first part of the key, which represents the bpy.data object
		if len(parts) > 2:
			parts = parts[2:]
		else:
			# If the key does not contain a period character, return the bpy.data object
			return bpy.data

		# Initialize a variable to hold the current object
		obj = bpy.data

		# Iterate through the parts of the key, using getattr or __getitem__ to access the corresponding attribute of the object at each level
		for part in parts:
			if '[' in part:
				# If the part contains a square bracket, it represents an indexed element, so use __getitem__ to access it
				# First, split the part on the '[' character to separate the attribute name from the index
				attr_parts = part.split('[')
				attr_name = attr_parts[0]  # the attribute name is the part before the '[' character
				index = attr_parts[1][:-1].replace('"', '')  # the index is the part between the '[' and ']' characters

				# Check if the index is a string or an integer, and use the appropriate method to access the element
				try:
					index = int(index)
				except ValueError:
					pass

				# Finally, use __getitem__ to access the indexed element
				obj = getattr(obj, attr_name)[index]
			else:
				# Otherwise, use getattr to access the attribute
				obj =  getattr(obj, part)

		# Return the final object
		return obj

	def split_string(self, s):
		# Find the index of the last '[' or '.' character in the string
		start_index = max(s.rindex('['), s.rindex('.'))

		# Find the index of the ']' character that corresponds to the '[' character found above, if it exists
		try:
			end_index = s.index(']', start_index)
		except ValueError:
			end_index = len(s)

		# Extract the part of the string before the '[' or '.' character
		path = s[:start_index]

		# Extract the part of the string between the '[' or '.' and ']' characters, if it exists
		level = s[start_index + 1:end_index].replace('"', '')

		# Determine the type of the level based on whether it is a number or a string
		if s[start_index:start_index+1] == '.':
			level_type = 'property'
		else:
			level_type = 'array'

		return path, level, level_type

	def set_object_value(self, key, value):
		path, level, level_type = self.split_string(key)
		obj = self.get_object(path)
		if (level_type == 'array'):
			obj[level] = value
		else:
			try:
				setattr(obj, level,  value)
			except Exception as err:
				if key.endswith(".color"):
					# fix colors expected to be non RGBA
					rgb = list(value)   # Convert to list
					rgb.pop()
					newColor = tuple(rgb)	
					try:
						setattr(obj, level,  newColor)
					except Exception as e:
						raise Exception("Tried to set - \"" + key  + "\" = \"" + str(value) + "\" converted to \"" + str(newColor) + "\"") from e
				else:
					raise Exception(key  + "; " + str(value)) from err

		return obj

def fn(suffix):
	cwd = args.working_directory
	# ensure cwd does not end with a slash or backslash
	if cwd.endswith("/") or cwd.endswith("\\"):
		cwd = cwd[:-1]
	
	filename = cwd + os.path.sep + args.session_id + suffix, # _BAND_0 is the first band
	# check if csv file exists
	if not os.path.isfile(filename[0]):
		raise Exception("csv file not found: " + filename[0])
	
	return filename[0]

def write_blend_file():
	# activate autopack if not already active
	#bpy.data.use_autopack = True
	#bpy.ops.file.pack_all()
	#bpy.ops.file.pack_all2()
	bpy.ops.wm.save_as_mainfile(filepath=args.output_filename + ".blend")

def prepare_video_rendering():
	bpy.context.scene.render.filepath = args.output_filename + ".mov"
	bpy.context.scene.render.film_transparent = str2bool(args.output_transparent)
	bpy.context.scene.render.ffmpeg.constant_rate_factor = 'HIGH'
	bpy.context.scene.render.image_settings.file_format = 'FFMPEG'
	bpy.context.scene.render.ffmpeg.format = 'QUICKTIME'
	bpy.context.scene.use_nodes = str2bool(args.output_using_compositor_node)

	if str2bool(args.output_transparent):
		bpy.context.scene.use_nodes = False
		bpy.context.scene.render.ffmpeg.codec = 'QTRLE'
		bpy.context.scene.render.image_settings.color_mode = 'RGBA'
	else:
		bpy.context.scene.render.ffmpeg.codec = 'H264'
		bpy.context.scene.render.image_settings.color_mode = 'RGB'

""" Programm start """
# Set the current frame to 1
bpy.context.scene.frame_current = 1
bpy.context.scene.render.engine = 'BLENDER_EEVEE'

bpy.context.scene.render.resolution_percentage = int(args.output_resolution)
bpy.context.scene.render.fps = int(args.output_fps)
bpy.context.scene.render.resolution_x = int(args.output_resolution_x)
bpy.context.scene.render.resolution_y = int(args.output_resolution_y)
wav_file_name = args.input + ".wav"
spec = AudioSpectrum(
	audio_wav_filename=wav_file_name 
)
spec.open_audio_wav_file()
# set the end frame of the current scene to the length of the audio file
frames = spec.get_video_frame_count(bpy.context.scene.render.fps)
if(int(args.output_frames) > 0):
	bpy.context.scene.frame_end = int(args.output_frames) + 1
else:
	bpy.context.scene.frame_end = frames   

if args.output_type == "image" or args.output_type == "video" or args.output_type == "blender": 
	json_data = None
	json_file_name = fn('.json')
	
	scene_controller = SceneController(wav_file_name)
	scene_controller.reset_audio(wav_file_name)

	# verify  if json file exists
	if not os.path.isfile(json_file_name):
		raise Exception("json file not found: " + json_file_name)

	with open(json_file_name) as json_file:
		json_data = json.load(json_file)
		config = ConfigController()
		# iterate over all parm array items using int index
		for i in range(len(json_data["parms"])):
			parm = json_data["parms"][i]
			if "value" in parm and parm["value"] != None:
				match parm["type"]:
					case "text":
						config.set_object_value(parm["path"], parm["value"])
					case "file":
						if os.path.isfile(parm["value"]):
							image = config.set_object_value(parm["path"], parm["value"])
							image.reload()
					case "color":
						color = scene_controller.hex_to_rgba(parm["value"])
						config.set_object_value(parm["path"], color)
					case _:
						raise Exception("Error: Unknown type '%s'" % parm["type"])

		scene_controller.set_info("scene_fps", int(bpy.context.scene.render.fps))
		scene_controller.reset_info_key_frames()
		scene_controller.set_info("song_bpm", json_data["bpm"])
		scene_controller.set_info("song_length_seconds", int(spec.audio_length_secs))
		scene_controller.write_song_progress_info_key_frames()
		scene_controller.write_song_section_detection_info_key_frames(json_data)
		scene_controller.write_beat_detection_info_key_frames(json_data)
		scene_controller.write_beat_impulse_info_key_frames(json_data)
		if "frequency_scale_max" in json_data:
			frequency_scale_max = json_data["frequency_scale_max"]
		else:
			frequency_scale_max = 1
			
		for i in range(scene_controller.get_requires_frequency_bands()):
			scene_controller.write_frequency_band_info_key_frames(i, frequency_scale_max)


match args.output_type:
	case "info":
		scene_controller = SceneController(None)
		# output sysinternal infos
		y = json.dumps({
			"__SSO_INTERNAL_MESSAGE": True,
			"info": True,
			"frame_end": bpy.context.scene.frame_end,
			"blender_version": bpy.app.version_string,
			"output_frames": args.output_frames,
			"wav_file_name": wav_file_name,
			"required_frequency_bands": scene_controller.get_requires_frequency_bands()
		})
		print(y)

	case "video":
		prepare_video_rendering()
		bpy.ops.render.render(animation=True)  
	
	case "blender":
		prepare_video_rendering()
		write_blend_file()
	
	case "image":
		bpy.context.scene.render.image_settings.file_format = 'PNG'
		bpy.context.scene.render.filepath = args.output_filename + ".png" 

		if(args.output_frames != -1):
			bpy.context.scene.frame_end = int(args.output_frames) + 1
			bpy.context.scene.frame_set(int(args.output_frames))

		bpy.ops.render.render(animation=False, write_still=True, use_viewport=False) 

		
""" Programm end """
