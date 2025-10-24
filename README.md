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
