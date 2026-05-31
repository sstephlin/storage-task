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

## Game Flow

1. Participant answers preliminary question as a form of bot detection
2. Participant engages in instruction slides. Each slide is shown for at least 2 seconds. For each quiz group, the participants will have 3 attempts to answer all questions correctly. If participant fails any quiz group after 3 attempts, they are disqualified from the study.
3. Participant enters TrainingPhase. If participant survives 50% of the training rounds, they will proceed. Otherwise, they will be disqualified.
4. Participant engages in 36 rounds of the main game. They have the opportunity to receive a bonus based on their performance.
5. Upon completion, participant will be redirected to the Qualtrics ending survey.

### Participants are permitted to do the following actions while engaging with the experiment:

Tab change:

- If a tab change is detected and user does not return after 15 seconds, the will be automatically redirected back to Prolific.

Stale Tutorial:

- If a tutorial slide has not be interacted with for over 3 minutes, a warning will display for 30 seconds. After 30 seconds, the participant will be redirected to Prolific

Refresh Page:

- If the participant attempts to refresh the page, a warning modal will appear confirming their action. Participants have the opportunity to return to the game. If no confirmation is provided and partcipant does not resume the game, they will be redirected to Prolific.
