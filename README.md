Clone this repo with
git clone https://github.com/[USERNAME]/storage-task.git

## Getting Started

1. Install necessary downloads:
   If you don’t already have Node installed, download it here: https://nodejs.org/en
   (LTS version recommended).
   You can verify the installation by running:

   node -v

   npm -v

2. Now, enter the server folder:

   cd server

3. Inside the project root folder, install all required packages:

   npm install

4. Set up environment variables
   - create a new file in server called .env
   - paste variables into this file
     ! Important: Never commit your .env file — it should stay private -- check .gitignore.

5. Run the server

   npm run dev

   Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Data Storage

1. Ensure you have service account keys
   create a new file inside servers/scripts called serviceAccountKey.json
   paste firebase information into this file

2. To convert data from firebase:
   enter the scripts folder:

   cd scripts

   run:

   node exportFireStore.js

   ! Important: Never commit the data files - they should stay private -- check .gitignore

# storage-task

This repository features a web application for the Maintenance Task, a scientific experiment about context-dependent reinforcement learning. The frontend contains an experimental work flow that begins with participant validition, prelimiary questions, and instructional tutorial. The task then moves onto a training phase, main phase, and game completion.

Currently, 4 versions of the 1 Vial game can be run simaltaneiously by altering the URL parameter. The process of including 2 vial versions is still the in process of being implemented.

For this application, real time updates and accurate logging of games states are the most important. Timing is managed strictly, ensure proper conditions and teardowns to no processes are running in the background.

## Game Versions

### V0.1: "one_vial_alternating"

1 vial for the entire duration of the game. Alternates between blocks of 9 rounds with/out storage available. 4 phases total.

### V0.2: "one_vial_always_bucket"

1 vial for the entire duration of the game. Storage is always available. Alternates between blocks of 9 rounds of abundance/deprivation phases. 4 phases total.

### V0.3: "one_vial_always_bucket_simple"

1 vial for the entire duration of the game. Storage is available for the entire duration of the game as well.

### V0.4: "one_vial_always_bucket_simple_fast"

1 vial for the entire duration of the game. Storage is available for the entire duration of the game as well. Drain rate is faster than V0.3

### V0.5: "two_vials_single_bucket"

2 vials for the entire duration of the game. The vial that has storage alternates, or no storage may be available for either vial. Storage conditions alternates every 6 rounds, totaling 6 phases.

### V0.6: "two_vials_phases"

2 vials for the entire duration of the game. Storage is always available, but the vial that has storage alternates. Alternates between blocks of 9 rounds of abundance/deprivation phases. 4 phases in total.

## Game Settings

Add amount: 10

Bucket Empty: 15

Training Rounds: 10

Main Game Rounds: 36

## Experiment Flow

The app is organized as a single-page React experiment. `App.jsx` controls the high-level participant flow and decides which screen should be shown.

1. **URL validation and session setup**
   - Participants enter through a URL containing `PROLIFIC_ID` and `STUDY_ID`.
   - `src/data/participantConfig.jsx` validates these URL params and maps the study code to an internal game version.
   - `src/hooks/useExperimentBootstrap.js` initializes access control and starts the Firebase logging session.

2. **Preliminary question**
   - The participant answers a preliminary question before seeing instructions.
   - The response is logged with `logPrelimAnswer`.

3. **Instructions/tutorial**
   - Instruction slides and quizzes live in `src/components/instructions.jsx`.
   - Each slide has a minimum viewing time.
   - The Next button is disabled until the next slide’s media is ready and the minimum view time as surpassed.
   - Quiz groups allow a limited number of attempts.
   - Failing the instruction checks disqualifies the participant and redirects them to the appropriate Prolific completion link.

4. **Training phase**
   - `src/components/TrainingPhase.jsx` manages the tutorial-to-training flow.
   - It builds a training sequence from `TRAINING_PARAMS`.
   - The participant must survive at least the required percentage of practice rounds.
   - Passing training shows a transition screen with the partial completion code before the main game begins.
   - Failing training redirects the participant to the training-failure link.

5. **Main game**
   - `src/components/VialGame.jsx` runs the actual game rounds.
   - Each round has a drain velocity, bucket/storage configuration, and phase label.
   - The player tries to keep vial levels near the ideal level while avoiding emptying or overflowing.
   - Round outcomes and button presses are logged to Firebase.

6. **Completion and redirect**
   - On main-game completion, final score, total rounds, progress, and bonus eligibility are logged.
   - The participant is redirected to the version-specific Qualtrics ending survey.

## Code Organization

Most experiment behavior is split between high-level flow components, game components, hooks, and data helpers.

### High-level app flow

- `src/App.jsx`
  - Coordinates the overall experiment state.
  - Decides whether to show the preliminary question, training, reload termination screen, or main game.
  - Handles completion, disqualification, and redirect callbacks.

- `src/hooks/useExperimentBootstrap.js`
  - Reads URL params.
  - Validates participant/game version information.
  - Checks reload/access-control state.
  - Initializes the logging session.

- `src/hooks/useReloadWarning.js`
  - Sets up browser reload/leave protection.

- `src/hooks/useReloadRedirect.js`
  - Handles the reload termination countdown and redirect.

- `src/hooks/useTabTermination.js`
  - Logs tab visibility changes.
  - Redirects participants if they remain away from the tab for too long.

### Training and instruction flow

- `src/components/instructions.jsx`
  - Shows tutorial slides.
  - Handles quiz answers, timing, warnings, and instruction disqualification.
  - Shows a "Preparing instructions" page if the first slide is not ready yet.
  - Every time a slide changes, the prev, next and next-next slides are preloaded. When the next slide is preloaded and the minimum view time surpassed, the next button will be enabled. The next button is disabled is the current slide is a quiz slide, the minimum time has not surpassed yet, the next slide is not ready, or not currently transitioning between slides.
  - Media is preloaded in the background as well one by one.
- `src/components/TrainingPhase.jsx`
  - Shows instructions, training intro, active practice rounds, pass/fail results, and the transition screen before the main game.
  - Uses `VialGame` in training mode.

### Main game logic

- `src/components/VialGame.jsx`
  - Owns the round-level state: current round, score, round timer, game completion, animations, and progress.
  - Calls hooks for controls, vial draining, gas-station behavior, and audio.

- `src/hooks/useVialControls.js`
  - Handles keyboard input.
  - Logs button presses.
  - Updates vial and bucket levels when participants add liquid or empty storage.

- `src/hooks/useVialGameLoop.js`
  - Runs the repeated vial-drain loop.
  - Fills buckets when drained liquid is captured by available storage.
  - Samples distance from the ideal level for performance scoring.

- `src/hooks/useGasStationControl.js`
  - Controls gas-station availability during abundance/deprivation versions.
  - Logs gas-station active/inactive events.

- `src/hooks/useAudioContext.js`
  - Creates and cleans up the browser audio context used by game sounds.

- `src/utils/vialGameLogic.js`
  - Contains pure game calculations such as round settings, bucket transfer amounts, vial ticking, failure type, and performance progress.

### Data, params, and logging

- `src/data/params.jsx`
  - Defines game constants, version configs, training params, velocity configs, and redirect URLs.

- `src/data/gameSequences.jsx`
  - Generates per-round velocity, bucket, and phase sequences for each game version.

- `src/data/logging.jsx`
  - Handles Firebase logging for sessions, tutorial events, preliminary answers, rounds, button presses, gas-station events, tab events, training results, and game completion.

- `src/data/accessControl.jsx`
  - Tracks participant access and reload/session state.

## Logging Overview

The experiment logs several categories of data:

- **Session start/end**
  - Participant ID, game version, production mode, and session timing.

- **Tutorial/instructions**
  - Slide changes, quiz answers, instruction pass/fail results, and stale-slide disqualification.

- **Training**
  - Whether the participant passed training, rounds survived.

- **Rounds**
  - Round number, phase, velocity, number of vials, bucket availability, initial vial/bucket levels, and round result.

- **Button presses**
  - Which control was pressed, current vial/bucket state, add amount, velocity, time since round start, and gas-station active state.

- **Gas-station events**
  - Whether the station is active or inactive.
  - Initial round setting should be logged at round start.
  - Later toggle logs should represent actual active/inactive changes.

- **Tab visibility**
  - When the participant hides or returns to the tab and which experiment stage they were in.

- **Game Config**
  - Displays all game settings in one central file.

## Important Experiment Protections

- **Reload protection**
  - Participants should not refresh or leave the page during the experiment.
  - Reload attempts trigger warning/termination behavior in production mode.

- **Tab-away termination**
  - If participants leave the tab and do not return within the configured time limit, they are redirected.

- **Single access**
  - Production access control is intended to prevent participants from restarting the experiment after beginning.

- **Intentional redirects**
  - Redirects triggered by the experiment are marked as intentional so browser unload protections do not block them.
