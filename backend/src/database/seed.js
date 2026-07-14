const fs = require('fs');
const path = require('path');
const https = require('https');
const GymLocation = require('../models/GymLocation');
const WorkoutVideo = require('../models/WorkoutVideo');
const WorkoutProgram = require('../models/WorkoutProgram');
const WorkoutDay = require('../models/WorkoutDay');
const Exercise = require('../models/Exercise');
const ExerciseVideo = require('../models/ExerciseVideo');

// Helper to download files with redirect handling
const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        https.get(response.headers.location, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            fs.unlink(dest, () => {});
            reject(new Error(`Failed to download: Status ${redirectResponse.statusCode}`));
            return;
          }
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
        return;
      }
      
      if (response.statusCode !== 200) {
        fs.unlink(dest, () => {});
        reject(new Error(`Failed to download: Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const seedDatabase = async () => {
  try {
    // 1. Seed Gym Location
    let gym = await GymLocation.findOne();
    if (!gym) {
      gym = await GymLocation.create({
        gymName: "FORGE Fitness & Fuel",
        address: "Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India",
        latitude: 26.2669994,
        longitude: 78.2169687,
        radius: 50,
        allowedRadius: 50,
        status: "active"
      });
      console.log('[SEED] Seeded default GymLocation FORGE Fitness & Fuel.');
    }

    // 2. Seed Old Workout Videos (if any old component relies on them)
    const videoCount = await WorkoutVideo.countDocuments();
    if (videoCount === 0) {
      const defaultVideos = [
        {
          title: 'Full Body Warmup',
          category: 'Cardio',
          muscleGroup: 'Full Body',
          level: 'Beginner',
          day: 'Day 1',
          duration: 5,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          description: 'Basic full-body dynamic joint rotations and light movements.',
          caloriesBurn: 30,
          equipmentRequired: 'None'
        }
      ];
      await WorkoutVideo.insertMany(defaultVideos);
      console.log('[SEED] Seeded old fallback WorkoutVideos.');
    }

    // Ensure templates directory exists for local video assets
    const templatesDir = path.join(__dirname, '../../public/uploads/workouts/templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    const template1Path = path.join(templatesDir, 'template1.mp4');
    const template2Path = path.join(templatesDir, 'template2.mp4');

    if (!fs.existsSync(template1Path)) {
      console.log('[SEED] Downloading local video template 1 from W3Schools (mov_bbb.mp4)...');
      try {
        await downloadFile('https://www.w3schools.com/html/mov_bbb.mp4', template1Path);
        console.log('[SEED] Template 1 downloaded successfully.');
      } catch (err) {
        console.error('[SEED] Failed to download Template 1:', err.message);
        fs.writeFileSync(template1Path, 'dummy video data'); // offline fallback
      }
    }

    if (!fs.existsSync(template2Path)) {
      console.log('[SEED] Downloading local video template 2 from W3Schools (movie.mp4)...');
      try {
        await downloadFile('https://www.w3schools.com/html/movie.mp4', template2Path);
        console.log('[SEED] Template 2 downloaded successfully.');
      } catch (err) {
        console.error('[SEED] Failed to download Template 2:', err.message);
        fs.writeFileSync(template2Path, 'dummy video data'); // offline fallback
      }
    }

    // 3. Seed Enterprise Workout Program (7-Day Beginner Program)
    // Force re-seed to match the exact newly requested exercise lists
    let program = await WorkoutProgram.findOne({ name: "7-Day Beginner Program" });
    if (program) {
      console.log('[SEED] Outdated program splits found. Wiping for the new 7-Day HD video program...');
      await WorkoutProgram.deleteOne({ _id: program._id });
      await WorkoutDay.deleteMany({ programId: program._id });
      await Exercise.deleteMany({});
      await ExerciseVideo.deleteMany({});
      program = null;
    }

    if (!program) {
      console.log('[SEED] Seeding new 7-Day Workout Program with 35 local HD video paths...');

      // Ensure local upload directory structure exists
      const baseUploadDir = path.join(__dirname, '../../public/uploads/workouts/beginner');
      for (let d = 1; d <= 7; d++) {
        const dayDir = path.join(baseUploadDir, `day${d}`);
        if (!fs.existsSync(dayDir)) {
          fs.mkdirSync(dayDir, { recursive: true });
        }
      }

      // Create Workout Program
      program = await WorkoutProgram.create({
        name: "7-Day Beginner Program",
        description: "A premium 7-day structured beginner program focused on proper form, progression tracking, and local HD video demonstrations.",
        difficulty: "Beginner",
        durationDays: 7,
        thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
      });

      // Redesigned exercises dataset matching the exact user list
      const daysData = [
        {
          dayNumber: 1,
          dayName: "Monday",
          title: "Full Body Endurance",
          description: "Engage multiple joint complexes and stimulate muscle groups to prime cardiorespiratory flow.",
          exercises: [
            {
              name: "Warm-Up & Dynamic Stretching",
              videoUrl: "https://www.youtube.com/watch?v=3pAmBm2zTvc&t=26",
              description: "Joint mobility drills, arm swings, neck rotations, and dynamic leg stretches to prime blood flow.",
              targetMuscles: ["Full Body"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 30,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Take deep breaths.", "Gradually increase intensity of stretches."],
              safetyInstructions: ["Do not stretch cold muscles too fast; warm up gently."]
            },
            {
              name: "Bodyweight Squats",
              videoUrl: "https://www.youtube.com/watch?v=3pAmBm2zTvc&t=64",
              description: "Squats targeting quads, hamstrings, and glute activation using bodyweight load.",
              targetMuscles: ["Quads", "Glutes"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 70,
              duration: 240,
              sets: 3,
              reps: "15 Reps",
              restTime: 30,
              tips: ["Keep heels glued to the floor.", "Sit backward like sitting on a chair."],
              safetyInstructions: ["Track knees straight with toes; don't let them collapse inward."]
            },
            {
              name: "Push-Ups",
              videoUrl: "https://www.youtube.com/watch?v=3pAmBm2zTvc&t=83",
              description: "Foundational chest push exercise targeting chest, shoulders, and triceps.",
              targetMuscles: ["Chest", "Triceps"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 90,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Keep standard straight alignment head to heels.", "Elbows back at 45 degrees."],
              safetyInstructions: ["Modify to knee push-ups if core fails to brace lower back."]
            },
            {
              name: "Mountain Climbers",
              videoUrl: "https://www.youtube.com/watch?v=3pAmBm2zTvc&t=102",
              description: "Cardio-core challenge in a plank position driving knees to chest.",
              targetMuscles: ["Core", "Shoulders"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 95,
              duration: 180,
              sets: 3,
              reps: "30 Secs",
              restTime: 30,
              tips: ["Keep back flat and hips level.", "Drive knees straight in towards chest."],
              safetyInstructions: ["Verify wrists are positioned directly under the shoulders."]
            },
            {
              name: "Plank",
              videoUrl: "https://www.youtube.com/watch?v=3pAmBm2zTvc&t=145",
              description: "Isometric plank hold to challenge dynamic abdominal stabilization and spinal alignment.",
              targetMuscles: ["Core"],
              equipmentRequired: "Mat",
              difficulty: "Beginner",
              calories: 50,
              duration: 180,
              sets: 3,
              reps: "45 Secs",
              restTime: 30,
              tips: ["Hold core and glutes engaged.", "Avoid dipping hips down."],
              safetyInstructions: ["Stop hold if you experience lower back pinch or strain."]
            }
          ]
        },
        {
          dayNumber: 2,
          dayName: "Tuesday",
          title: "Chest & Triceps",
          description: "Focused pushing routines to build upper torso push strength and tone tricep muscles.",
          exercises: [
            {
              name: "Flat Barbell Bench Press",
              videoUrl: "https://www.youtube.com/watch?v=LxVGDLLss3U&t=20",
              description: "Perform barbell bench press on flat bench to build chest thickness.",
              targetMuscles: ["Chest"],
              equipmentRequired: "Barbell & Bench",
              difficulty: "Beginner",
              calories: 80,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Keep shoulder blades retracted.", "Press bar straight up in a slight arc."],
              safetyInstructions: ["Always use a spotter when lifting heavy weight."]
            },
            {
              name: "Incline Dumbbell Press",
              videoUrl: "https://www.youtube.com/watch?v=LxVGDLLss3U&t=130",
              description: "Press dumbbells on an incline bench to target upper pectoral clavicular head.",
              targetMuscles: ["Chest", "Shoulders"],
              equipmentRequired: "Dumbbells & Bench",
              difficulty: "Beginner",
              calories: 85,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Keep incline angle around 30-45 degrees.", "Press dumbbells close together at top."],
              safetyInstructions: ["Do not let elbows flare out too wide to protect rotator cuffs."]
            },
            {
              name: "Incline Dumbbell Fly",
              videoUrl: "https://www.youtube.com/watch?v=LxVGDLLss3U&t=245",
              description: "Perform flyes on an incline bench to stretch and isolate the pectorals.",
              targetMuscles: ["Chest"],
              equipmentRequired: "Dumbbells & Bench",
              difficulty: "Beginner",
              calories: 75,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Keep a slight bend in elbows.", "Focus on squeezing chest at top of motion."],
              safetyInstructions: ["Do not overstretch; lower weights only to chest level."]
            },
            {
              name: "Push-Ups",
              videoUrl: "https://www.youtube.com/watch?v=LxVGDLLss3U&t=435",
              description: "Standard bodyweight push-ups to challenge horizontal chest press capacity.",
              targetMuscles: ["Chest", "Triceps"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 90,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Brace abs tight.", "Ensure complete lockout at top of movement."],
              safetyInstructions: ["Control the eccentric phase downward to avoid shoulder impingement."]
            },
            {
              name: "Chest Stretch & Cool Down",
              videoUrl: "https://www.youtube.com/watch?v=LxVGDLLss3U&t=520",
              description: "Static holds targeting shoulders, pectorals, and back of arms.",
              targetMuscles: ["Chest", "Shoulders"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 15,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Hold hands behind hips.", "Breathe slow and steady."],
              safetyInstructions: ["Do not overstretch shoulder joint capsule."]
            }
          ]
        },
        {
          dayNumber: 3,
          dayName: "Wednesday",
          title: "Back & Biceps",
          description: "Pulling split to build upper back posture, spinal health, and bicep flexors.",
          exercises: [
            {
              name: "Warm-Up",
              videoUrl: "https://www.youtube.com/watch?v=HoNckRoSZfk&t=0",
              description: "Dynamic warm up movements to lubricate pulling joints.",
              targetMuscles: ["Full Body"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 30,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Keep a steady breathing pattern.", "Slowly increase range of motion."],
              safetyInstructions: ["Do not perform jerky movements."]
            },
            {
              name: "Exercise 2",
              videoUrl: "https://www.youtube.com/watch?v=HoNckRoSZfk&t=120",
              description: "Exercise 2 targeting pulling chain and dynamic stability.",
              targetMuscles: ["Back", "Biceps"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 80,
              duration: 240,
              sets: 3,
              reps: "15 Reps",
              restTime: 30,
              tips: ["Pull with control.", "Hold peak contraction."],
              safetyInstructions: ["Maintain neutral straight spine."]
            },
            {
              name: "Exercise 3",
              videoUrl: "https://www.youtube.com/watch?v=HoNckRoSZfk&t=240",
              description: "Exercise 3 targeting shoulders and upper back split.",
              targetMuscles: ["Back", "Shoulders"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 75,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Squeeze shoulder blades.", "Control dynamic range."],
              safetyInstructions: ["Do not swing shoulders."]
            },
            {
              name: "Exercise 4",
              videoUrl: "https://www.youtube.com/watch?v=HoNckRoSZfk&t=360",
              description: "Exercise 4 targeting biceps flexor isolation.",
              targetMuscles: ["Biceps"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 75,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Keep elbows locked at sides.", "Squeeze at peak."],
              safetyInstructions: ["Keep wrist straight and neutral."]
            },
            {
              name: "Cool Down / Final Exercise",
              videoUrl: "https://www.youtube.com/watch?v=HoNckRoSZfk&t=480",
              description: "Cooldown flexions to stretch back and biceps muscles.",
              targetMuscles: ["Back", "Biceps"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 20,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Relax lower back completely.", "Hold stretch position statically."],
              safetyInstructions: ["Perform movements slowly; avoid sudden spine extensions."]
            }
          ]
        },
        {
          dayNumber: 4,
          dayName: "Thursday",
          title: "Legs",
          description: "Dedicated lower body day targeting quads, hamstrings, glutes, and calves for balanced foundation.",
          exercises: [
            {
              name: "Warm-Up",
              videoUrl: "https://www.youtube.com/watch?v=4tiIOw4eEjk&t=0",
              description: "Dynamic warm up movements to lubricate lower body joints.",
              targetMuscles: ["Full Body"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 30,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Keep standard range of movement.", "Breathe continuously."],
              safetyInstructions: ["Do not stretch beyond comfortable limit."]
            },
            {
              name: "Exercise 2",
              videoUrl: "https://www.youtube.com/watch?v=4tiIOw4eEjk&t=120",
              description: "Exercise 2 targeting quads and glutes activation.",
              targetMuscles: ["Quads", "Glutes"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 75,
              duration: 240,
              sets: 3,
              reps: "15 Reps",
              restTime: 30,
              tips: ["Drive up through your heels.", "Keep chest tall."],
              safetyInstructions: ["Ensure knees stay tracked inline with feet."]
            },
            {
              name: "Exercise 3",
              videoUrl: "https://www.youtube.com/watch?v=4tiIOw4eEjk&t=240",
              description: "Exercise 3 targeting hamstring extension and glute bridge.",
              targetMuscles: ["Hamstrings", "Glutes"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 70,
              duration: 240,
              sets: 3,
              reps: "15 Reps",
              restTime: 30,
              tips: ["Push hips straight up.", "Squeeze glutes at peak."],
              safetyInstructions: ["Do not overextend lower back."]
            },
            {
              name: "Exercise 4",
              videoUrl: "https://www.youtube.com/watch?v=4tiIOw4eEjk&t=360",
              description: "Exercise 4 targeting calves flexion control.",
              targetMuscles: ["Calves"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 45,
              duration: 180,
              sets: 3,
              reps: "20 Reps",
              restTime: 30,
              tips: ["Lift heels as high as possible.", "Hold peak 1s."],
              safetyInstructions: ["Hold on to support for stability if needed."]
            },
            {
              name: "Cool Down",
              videoUrl: "https://www.youtube.com/watch?v=4tiIOw4eEjk&t=480",
              description: "Cool down static stretching routine for lower body recovery.",
              targetMuscles: ["Legs"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 15,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Relax muscles.", "Hold static postures."],
              safetyInstructions: ["Stop stretching if pain occurs."]
            }
          ]
        },
        {
          dayNumber: 5,
          dayName: "Friday",
          title: "Shoulders",
          description: "Build shoulder width and improve rotator cuff stability using simple movements.",
          exercises: [
            {
              name: "Warm-Up",
              videoUrl: "https://www.youtube.com/watch?v=-Lfge31AkBc&t=0",
              description: "Dynamic warm up movements to lubricate shoulder joint cap and rotate rotator cuffs.",
              targetMuscles: ["Shoulders"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 30,
              duration: 180,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Keep arms fully straight and parallel to the floor.", "Perform small, tight circles."],
              safetyInstructions: ["Slow down if you hear joint popping or feel rubbing."]
            },
            {
              name: "Exercise 2",
              videoUrl: "https://www.youtube.com/watch?v=-Lfge31AkBc&t=120",
              description: "Exercise 2 targeting vertical push loading and active shoulder press.",
              targetMuscles: ["Shoulders", "Triceps"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 80,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Raise hips high in a V-shape.", "Lower head gently to floor between hands."],
              safetyInstructions: ["Keep shoulders braced and wrists firmly placed on floor."]
            },
            {
              name: "Exercise 3",
              videoUrl: "https://www.youtube.com/watch?v=-Lfge31AkBc&t=240",
              description: "Exercise 3 targeting anterior and lateral deltoids isolation.",
              targetMuscles: ["Shoulders"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 75,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Stand tall.", "Press weights straight overhead until locked."],
              safetyInstructions: ["Do not arch lower back to push weights."]
            },
            {
              name: "Exercise 4",
              videoUrl: "https://www.youtube.com/watch?v=-Lfge31AkBc&t=360",
              description: "Exercise 4 targeting lateral deltoids with controlled raises.",
              targetMuscles: ["Shoulders"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 60,
              duration: 240,
              sets: 3,
              reps: "12 Reps",
              restTime: 30,
              tips: ["Raise arms up to side height.", "Slight elbow bend, control descent."],
              safetyInstructions: ["Avoid throwing weights with body momentum."]
            },
            {
              name: "Cool Down",
              videoUrl: "https://www.youtube.com/watch?v=-Lfge31AkBc&t=480",
              description: "Static stretching routine targeting rotator cuffs and shoulder girdle.",
              targetMuscles: ["Shoulders"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 15,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Hold arm straight across body.", "Exhale deep to relax shoulders."],
              safetyInstructions: ["Never pull on joint directly; pull on arm muscles instead."]
            }
          ]
        },
        {
          dayNumber: 6,
          dayName: "Saturday",
          title: "Core Definition",
          description: "Hyper-focused core day targeting rectus abdominis, obliques, and deep transverse stabilizers.",
          exercises: [
            {
              name: "Warm-Up",
              videoUrl: "https://www.youtube.com/watch?v=5i8y-_cbwgw&t=0",
              description: "Dynamic warm up movements to mobilize core complex.",
              targetMuscles: ["Core"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 30,
              duration: 180,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Keep spine loose.", "Rotate core gently."],
              safetyInstructions: ["Do not rotate quickly."]
            },
            {
              name: "Exercise 2",
              videoUrl: "https://www.youtube.com/watch?v=5i8y-_cbwgw&t=120",
              description: "Exercise 2 targeting rectus abdominis and obliques rotation.",
              targetMuscles: ["Abs", "Obliques"],
              equipmentRequired: "Mat",
              difficulty: "Beginner",
              calories: 60,
              duration: 180,
              sets: 3,
              reps: "15 Per Side",
              restTime: 30,
              tips: ["Rotate shoulders completely.", "Squeeze obliques."],
              safetyInstructions: ["Do not pull on neck."]
            },
            {
              name: "Exercise 3",
              videoUrl: "https://www.youtube.com/watch?v=5i8y-_cbwgw&t=240",
              description: "Exercise 3 targeting lower abdominal activation.",
              targetMuscles: ["Lower Abs"],
              equipmentRequired: "Mat",
              difficulty: "Beginner",
              calories: 65,
              duration: 180,
              sets: 3,
              reps: "15 Reps",
              restTime: 30,
              tips: ["Lower legs slowly.", "Keep lower back flat."],
              safetyInstructions: ["Stop if lower back arches up."]
            },
            {
              name: "Exercise 4",
              videoUrl: "https://www.youtube.com/watch?v=5i8y-_cbwgw&t=360",
              description: "Exercise 4 targeting obliques and transverse cylinders.",
              targetMuscles: ["Core", "Obliques"],
              equipmentRequired: "Mat",
              difficulty: "Beginner",
              calories: 60,
              duration: 180,
              sets: 3,
              reps: "20 Twists",
              restTime: 30,
              tips: ["Keep spine straight.", "Touch ground each side."],
              safetyInstructions: ["Control the speed of rotations."]
            },
            {
              name: "Cool Down",
              videoUrl: "https://www.youtube.com/watch?v=5i8y-_cbwgw&t=480",
              description: "Cool down stretching routine for abdominal wall recovery.",
              targetMuscles: ["Core"],
              equipmentRequired: "Mat",
              difficulty: "Beginner",
              calories: 15,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Lie flat and stretch body long.", "Calm down breathing."],
              safetyInstructions: ["Never pull muscles hard."]
            }
          ]
        },
        {
          dayNumber: 7,
          dayName: "Sunday",
          title: "Cardio & Recovery",
          description: "Active recovery and low-intensity cardio to flush metabolic waste and calm mind.",
          exercises: [
            {
              name: "Warm-Up",
              videoUrl: "https://www.youtube.com/watch?v=MdmrrtWyyjg&t=0",
              description: "Full body active warmup and dynamic flexibility stretches.",
              targetMuscles: ["Full Body"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 30,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Breathe deep and focus on range.", "Calm state initiation."],
              safetyInstructions: ["Do not overextend cold muscles."]
            },
            {
              name: "Exercise 2",
              videoUrl: "https://www.youtube.com/watch?v=MdmrrtWyyjg&t=120",
              description: "Exercise 2 cardio endurance sequence.",
              targetMuscles: ["Full Body"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 70,
              duration: 180,
              sets: 3,
              reps: "45 Secs",
              restTime: 20,
              tips: ["Keep standard dynamic pacing.", "Land softly."],
              safetyInstructions: ["Ensure supportive footwear is worn."]
            },
            {
              name: "Exercise 3",
              videoUrl: "https://www.youtube.com/watch?v=MdmrrtWyyjg&t=240",
              description: "Exercise 3 lower body power flow.",
              targetMuscles: ["Legs", "Cardio"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 80,
              duration: 180,
              sets: 3,
              reps: "45 Secs",
              restTime: 20,
              tips: ["Keep chest tall and drive up.", "Coordinate movements."],
              safetyInstructions: ["Check surface is dry and safe."]
            },
            {
              name: "Exercise 4",
              videoUrl: "https://www.youtube.com/watch?v=MdmrrtWyyjg&t=360",
              description: "Exercise 4 full body high metabolic challenge.",
              targetMuscles: ["Full Body"],
              equipmentRequired: "None",
              difficulty: "Beginner",
              calories: 90,
              duration: 240,
              sets: 3,
              reps: "10 Reps",
              restTime: 45,
              tips: ["Maintain solid core bracing.", "Focus on speed control."],
              safetyInstructions: ["Brace abs when stepping back."]
            },
            {
              name: "Cool Down",
              videoUrl: "https://www.youtube.com/watch?v=MdmrrtWyyjg&t=480",
              description: "Restorative static recovery stretch and breathing.",
              targetMuscles: ["Flexibility"],
              equipmentRequired: "Mat",
              difficulty: "Beginner",
              calories: 15,
              duration: 300,
              sets: 1,
              reps: "5 Mins",
              restTime: 0,
              tips: ["Hold passive postures.", "Box breathe slowly."],
              safetyInstructions: ["Relax fully; do not bounce stretch."]
            }
          ]
        }
      ];

      // Seeding logic
      for (const dayData of daysData) {
        const exerciseIds = [];
        let order = 1;

        for (const exData of dayData.exercises) {
          const programSlug = "beginner";
          const daySlug = `day${dayData.dayNumber}`;
          const exerciseSlug = exData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const localVideoUrl = `/uploads/workouts/${programSlug}/${daySlug}/${exerciseSlug}.mp4`;

          let videoUrlToSave = localVideoUrl;
          let storageTypeToSave = 'local';

          if (exData.videoUrl) {
            videoUrlToSave = exData.videoUrl;
            storageTypeToSave = 'external';
          } else {
            // Copy template to destination
            const destDir = path.join(__dirname, `../../public/uploads/workouts/${programSlug}/${daySlug}`);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }

            const destPath = path.join(destDir, `${exerciseSlug}.mp4`);
            if (!fs.existsSync(destPath)) {
              const selectedTemplate = (order % 2 === 0) ? template1Path : template2Path;
              try {
                fs.copyFileSync(selectedTemplate, destPath);
              } catch (err) {
                console.error(`[SEED] Failed to copy template to ${destPath}:`, err.message);
              }
            }
          }

          const exercise = await Exercise.create({
            name: exData.name,
            title: exData.name,
            description: exData.description,
            targetMuscles: exData.targetMuscles,
            muscleGroup: exData.targetMuscles.join(', '),
            equipmentRequired: exData.equipmentRequired,
            difficulty: exData.difficulty,
            calories: exData.calories,
            duration: exData.duration,
            sets: exData.sets,
            reps: exData.reps,
            restTime: exData.restTime,
            tips: exData.tips,
            instructions: exData.tips,
            safetyInstructions: exData.safetyInstructions,
            videoUrl: videoUrlToSave,
            thumbnailUrl: `https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60`,
            thumbnail: `https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60`,
            completed: false,
            order: order++
          });

          // Seed in ExerciseVideos too
          await ExerciseVideo.create({
            exerciseId: exercise._id,
            videoUrl: videoUrlToSave,
            thumbnailUrl: exercise.thumbnailUrl,
            storageType: storageTypeToSave
          });

          exerciseIds.push(exercise._id);
        }

        // Create Day with dayName and description
        await WorkoutDay.create({
          programId: program._id,
          dayNumber: dayData.dayNumber,
          title: dayData.title,
          dayName: dayData.dayName,
          description: dayData.description,
          exercises: exerciseIds
        });
      }

      console.log('[SEED] Seeded new 7-Day Workout Program successfully!');
    }

  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seedDatabase;
