/**
 * Tutorial slide definitions for different game versions.
 */
import { GAME_VERSIONS } from "./params";

const SHARED_INTRO_SLIDES = [
  { id: "intro-1.1", image: "Intro-1.1.png", showButtons: false },
  { id: "intro-1.2", image: "Intro-1.2.png", showButtons: false },
  { id: "intro-1.3", image: "Intro-1.3.png", showButtons: false },
  { id: "intro-1.4", image: "Intro-1.4.png", showButtons: false },
  { id: "intro-2.1", image: "Intro-2.1.png", showButtons: false },
  { id: "intro-2.2", image: "Intro-2.2.png", showButtons: false },
  { id: "intro-2.3", image: "Intro-2.3.png", showButtons: false },
  {
    id: "intro-3",
    image: "gifs/blinking.mp4",
    title: "This is Bleeblop. Bleeblop is a robot.",
    showButtons: false,
  },
  {
    id: "intro-4",
    image: "gifs/thinking.mp4",
    title:
      "Bleeblop's Goal is to Reach Robonia in time for the yearly Roboday celebration,",
    showButtons: false,
  },
  { id: "intro-5", image: "Intro-5.png", showButtons: false },
  { id: "intro-6", image: "Intro-6.png", showButtons: false },
  { id: "intro-7", image: "Intro-7.png", showButtons: false },
  { id: "intro-8", image: "Intro-8.png", showButtons: false },
  { id: "intro-9", image: "Intro-9.png", showButtons: false },
  { id: "intro-10", image: "Intro-10.png", showButtons: false },
  { id: "intro-11", image: "Intro-11.png", showButtons: false },
  { id: "intro-12", image: "Intro-12.png", showButtons: false },
  { id: "intro-13", image: "Intro-13.png", showButtons: false },
  { id: "intro-14", image: "Intro-14.png", showButtons: false },
  { id: "intro-15", image: "Intro-15.png", showButtons: false },
  { id: "intro-16", image: "Intro-16.png", showButtons: false },
  { id: "intro-17", image: "Intro-17.png", showButtons: false },
];
const SHARED_COMMANDS_SLIDES_PART1 = [
  { id: "commands-1", image: "Commands-1.png", showButtons: false },
  {
    id: "commands-2",
    image: "gifs/leftclick.mp4",
    title: "Use the left arrow key to add to the main gloop container.",
    showButtons: false,
  },
];

const SHARED_COMMANDS_SLIDES_PART2 = [
  {
    id: "commands-4",
    image: "gifs/draining1.mp4",
    title:
      "When BleeBlop has more than the ideal amount of gloop, the gloop that naturally drains will fill this container.",
    showButtons: false,
  },
  {
    id: "commands-5",
    image: "gifs/draining2.mp4",
    title:
      "IMPORTANT: this only happens if Bleeblop has MORE than the ideal amount of gloop. If their gloop is at or below the ideal level, the draining gloop is simply lost.",
    showButtons: false,
  },
  {
    id: "commands-6",
    image: "gifs/upclick.mp4",
    title:
      "By clicking the up arrow, you can dump some stored gloop back into the main gloop container.",
    showButtons: false,
  },
  {
    id: "commands-7",
    image: "gifs/upclick.mp4",
    title:
      "Note that adding stored gloop cannot not bring Bleeblop's gloop levels any higher than the ideal.",
    showButtons: false,
  },
  {
    id: "commands-8",
    image: "gifs/upclick.mp4",
    title:
      "*If you choose to add stored gloop and doing so would cause Bleeblop's gloop levels to go over the ideal, only the amount that would bring Bleeblop's gloop levels to the ideal will be added",
    showButtons: false,
  },
  {
    id: "commands-9",
    image: "gifs/map.mp4",
    title:
      "At the end of each day, you will get to see how far you helped Bleeblop travel.",
    showButtons: false,
  },

  { id: "commands-10", image: "Commands-8.png", showButtons: false },
];

const SHARED_COMMANDS_SLIDES_PART3 = [
  { id: "commands-12", image: "Commands-10.png", showButtons: false },
];

const STORAGE_INTRO_SOMETIMES = [
  { id: "commands-3", image: "Commands-3.png", showButtons: false },
];
const STORAGE_INTRO_ALWAYS = [
  {
    id: "commands-3-Always-Storage",
    image: "Commands-3-Always-Storage.png",
    showButtons: false,
  },
];

const KEEP_STORE_SOMETIMES = [
  { id: "commands-11", image: "Commands-9.png", showButtons: false },
];

const KEEP_STORE_ALWAYS = [
  {
    id: "commands-11",
    image: "Commands-9-Always-Storage.png",
    showButtons: false,
  },
];
const SHARED_INTRO_QUIZ_GROUP = {
  id: "group-intro-quiz",
  type: "quizGroup",
  returnToSlide: "intro-17",
  correctSlide: "quiz-correct",
  incorrectSlide: "quiz-wrong",
  exitSlide: "exit-slide",
  showButtons: false,
  quizzes: [
    {
      id: "quiz-1",
      title: "Quick Check: Where is BleeBlop trying to go?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          { id: "a", text: "To Mars", correct: false },
          { id: "b", text: "To Robonia", correct: true },
          { id: "c", text: "To Providence, RI", correct: false },
          { id: "d", text: "Out on the town", correct: false },
          { id: "e", text: "Disneyland", correct: false },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "quiz-2",
      title:
        "Quick Check: What happens to BleeBlop's gloop containers over time?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          { id: "a", text: "It freezes", correct: false },
          { id: "b", text: "It fills", correct: false },
          { id: "c", text: "Nothing", correct: false },
          { id: "d", text: "It drains", correct: true },
          { id: "e", text: "It expands", correct: false },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "quiz-3",
      title: "What happens if Bleeblop's gloop containers maxes out?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "Bleeblop moves as fast as possible",
            correct: false,
          },
          {
            id: "b",
            text: "Bleepblop overheats and must go back for help",
            correct: true,
          },
          { id: "c", text: "Bleeblop slows moving completely", correct: false },
          { id: "d", text: "Nothing", correct: false },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "quiz-4",
      title: "What happens if Bleeblop's gloop container empties?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "Bleepblop stops moving completely",
            correct: false,
          },
          {
            id: "b",
            text: "Bleeblop moves as fast as possible",
            correct: false,
          },
          {
            id: "c",
            text: "Bleeblop shuts down and must go back for help",
            correct: true,
          },
          { id: "d", text: "Nothing", correct: false },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "quiz-5",
      title: "When does BleeBlop move the fastest?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "When their gloop level is as high as possible",
            correct: false,
          },
          {
            id: "b",
            text: "When their gloop level is at the ideal height",
            correct: true,
          },
          {
            id: "c",
            text: "When their gloop level is just below the maximum",
            correct: false,
          },
          {
            id: "d",
            text: "When their gloop levels are as low as possible",
            correct: false,
          },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
  ],
};
const SHARED_COMMANDS_QUIZ_GROUP = {
  id: "group-commands-quiz",
  type: "quizGroup",
  returnToSlide: "commands-10",
  correctSlide: "quiz-correct",
  incorrectSlide: "quiz-wrong",
  exitSlide: "exit-slide",
  showButtons: false,
  quizzes: [
    {
      id: "quiz-8",
      title:
        "What key allows you use to add to Bleeblop's main gloop container without using stored gloop?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          { id: "a", text: "Space bar", correct: false },
          { id: "b", text: "Left arrow key", correct: true },
          { id: "c", text: "Right arrow key", correct: false },
          { id: "d", text: "Up arrow key", correct: false },
          { id: "e", text: "Shift key", correct: false },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "quiz-9",
      title:
        "What key can you use to dump gloop into the main container from storage?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          { id: "a", text: "Space bar", correct: false },
          { id: "b", text: "Left arrow key", correct: false },
          { id: "c", text: "Right arrow key", correct: false },
          { id: "d", text: "Up arrow key", correct: true },
          { id: "e", text: "Shift key", correct: false },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "quiz-10",
      title: "When does gloop get stored? (mark all necessary conditions)",
      multiSelect: true,
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "The gloop in the main container is above the ideal level",
            correct: true,
          },
          {
            id: "b",
            text: "The gloop in the main container is draining",
            correct: true,
          },
          { id: "c", text: "The round has ended", correct: false },
          {
            id: "d",
            text: "The storage container has empty space",
            correct: true,
          },
          {
            id: "e",
            text: "The main gloop container is filled above its max",
            correct: false,
          },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "quiz-13",
      title:
        "When can Bleeblop's stored gloop be used to bring their gloop levels above the ideal?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "Always",
            correct: false,
          },
          { id: "b", text: "Never", correct: true },
          {
            id: "c",
            text: "Only if it is a round where storage is available",
            correct: false,
          },
          {
            id: "d",
            text: "Only if it is a round where storage is not available",
            correct: false,
          },
          {
            id: "e",
            text: "Only if the storage container is full",
            correct: false,
          },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "quiz-11",
      title: "When is Bleeblop's stored gloop reset?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "When the main container reaches the ideal level ",
            correct: false,
          },
          { id: "b", text: "Never", correct: true },
          { id: "c", text: "At the end of each day", correct: false },
          { id: "d", text: "When Bleeblop reaches Robonia", correct: false },
          {
            id: "e",
            text: "When Bleeblop overheats or shuts down",
            correct: false,
          },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "quiz-12",
      title: "When is Bleeblop's main gloop container reset?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          { id: "a", text: "When it reaches the ideal level ", correct: false },
          { id: "b", text: "Never", correct: false },
          { id: "c", text: "At the end of each day", correct: true },
          { id: "d", text: "When Bleeblop reaches Robonia", correct: false },
          {
            id: "e",
            text: "When Bleeblop overheats or shuts down",
            correct: false,
          },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
  ],
};
const ABUND_DEPR_SLIDES = [
  { id: "ad-1", image: "AD1.png", showButtons: false },
  { id: "ad-2", image: "AD2.png", showButtons: false },
  { id: "ad-3", image: "AD3.png", showButtons: false },
  { id: "ad-4", image: "AD4.png", showButtons: false },
  { id: "ad-5", image: "AD5.png", showButtons: false },
  { id: "ad-6", image: "AD6.png", showButtons: false },
  { id: "ad-7", image: "AD7.png", showButtons: false },
  { id: "ad-8", image: "AD8.png", showButtons: false },
];
const SHARED_ENDING_QUIZ_GROUP = {
  id: "group-ending-quiz",
  type: "quizGroup",
  returnToSlide: "end-1",
  showButtons: false,
  quizzes: [
    {
      id: "quiz-end",
      title: "What must happen for you to receive the $4 bonus?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          { id: "a", text: "Bleeblop uses all of their gloop", correct: false },
          { id: "b", text: "Bleeblop goes to a repair shop", correct: false },
          {
            id: "c",
            text: "Bleeblop gets 75% of the way to Robonia",
            correct: true,
          },
          {
            id: "d",
            text: "Bleeblop never overheats or shuts down",
            correct: false,
          },
          {
            id: "e",
            text: "Bleeblop gets all the way to Robonia",
            correct: false,
          },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
  ],
};
const ABUND_DEPR_QUIZ_GROUP = {
  id: "group-ad-quiz",
  type: "quizGroup",
  returnToSlide: "ad-8",
  showButtons: false,
  quizzes: [
    {
      id: "AD-quiz-1",
      title: "Will Bleeblop always have free access to gloop?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "Yes; gloop is easy to come by for Bleeblop",
            correct: false,
          },
          {
            id: "b",
            text: "No; sometimes Bleeblop's access to gloop will be completely cut off.",
            correct: false,
          },
          {
            id: "c",
            text: "No; sometimes Bleeblop's access to gloop will be limited to what they have in storage",
            correct: true,
          },
          {
            id: "d",
            text: "Yes; Bleeblop has friends that are willing to share gloop whenever necessary.",
            correct: false,
          },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "AD-quiz-2",
      title: "When does Bleeblop have free access to gloop?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "When Bleeblop is at the repair shop",
            correct: false,
          },
          { id: "b", text: "When the gloop pump is green", correct: true },
          { id: "c", text: "When Bleeblop shuts down", correct: false },
          { id: "d", text: "When the gloop pump is grey", correct: false },
          { id: "e", text: "When Bleeblop reaches Robonia", correct: false },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "AD-quiz-3",
      title: "When is Bleeblop's access to gloop limited?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "When Bleeblop is at the repair shop",
            correct: false,
          },
          { id: "b", text: "When the gloop pump is green", correct: false },
          { id: "c", text: "When Bleeblop reaches Robonia", correct: false },
          {
            id: "d",
            text: "Bleeblop's gloop access is never limited",
            correct: false,
          },
          { id: "e", text: "When the gloop pump is grey", correct: true },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "AD-quiz-4",
      title:
        "Where can Bleeblop get gloop from when their access to gloop is limited?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "From their gloop storage container",
            correct: true,
          },
          { id: "b", text: "From the repair shop", correct: false },
          {
            id: "c",
            text: "Bleeblop's gloop access is never limited",
            correct: false,
          },
          { id: "d", text: "From Bleeblop's friends", correct: false },
          {
            id: "e",
            text: "Nowhere; Bleeblop's gloop access is all or nothing",
            correct: false,
          },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
    {
      id: "AD-quiz-5",
      title:
        "Does clicking the left arrow key have any effect when the gloop pump is grey?",
      content: "",
      type: "quiz",
      quiz: {
        options: [
          {
            id: "a",
            text: "Yes; it causes Bleeblop to go back to the nearest repair shop",
            correct: false,
          },
          { id: "b", text: "No; it has no direct effect ", correct: true },
          {
            id: "c",
            text: "Yes; it causes gloop to be added to Bleeblop's main gloop container",
            correct: false,
          },
          {
            id: "d",
            text: "Yes; it dumps gloop from storage into Bleeblop's main gloop container",
            correct: false,
          },
          {
            id: "e",
            text: "Nowhere; Bleeblop's gloop access is all or nothing",
            correct: false,
          },
        ],
        explanation: "Correct!",
      },
      showButtons: false,
    },
  ],
};
const SHARED_ENDING_SLIDES = [
  { id: "end-1", image: "Ending1.png", showButtons: false },
  { id: "end-2", image: "Ending2.png", showButtons: false },
  { id: "end-3", image: "Ending3.png", showButtons: false },
];

const TWO_VIAL_ENDING_SLIDES = [
  { id: "end-1", image: "Ending1.png", showButtons: false },
  { id: "end-2", image: "EndingAD2.png", showButtons: false },
  { id: "end-3", image: "Ending3.png", showButtons: false },
];
const SHARED_READY_SLIDES = [
  { id: "ready-1", image: "Ready1.png", showButtons: false },
  { id: "ready-2", image: "Ready2.png", showButtons: false },
  { id: "ready-3", image: "Ready3.png", showButtons: false },
  { id: "ready-4", image: "Ready4.png", showButtons: false },
];
const SHARED_READY_SLIDES_STORAGE = [
  { id: "ready-1", image: "Ready1-Storage.png", showButtons: false },
  { id: "ready-2", image: "Ready2-Storage.png", showButtons: false },
  { id: "ready-3", image: "Ready3-Storage.png", showButtons: false },
  { id: "ready-4", image: "Ready4-Storage.png", showButtons: false },
];

// const QUIZ_RESULT_SLIDES = [
//   { id: "quiz-correct", image: "quiz-correct.png", showButtons: false },
//   { id: "quiz-wrong", image: "quiz-wrong.png", showButtons: false },
//   { id: "exit-slide", image: "exit-slide.png", showButtons: false },
// ];

// ASSEMBLE SLIDES
const VERSION_SLIDE_SEQUENCES = {
  [GAME_VERSIONS.ONE_VIAL_ALTERNATING]: [
    ...SHARED_INTRO_SLIDES,
    SHARED_INTRO_QUIZ_GROUP,
    ...SHARED_COMMANDS_SLIDES_PART1,
    ...STORAGE_INTRO_SOMETIMES,
    ...SHARED_COMMANDS_SLIDES_PART2,
    ...KEEP_STORE_SOMETIMES,
    ...SHARED_COMMANDS_SLIDES_PART3,
    SHARED_COMMANDS_QUIZ_GROUP,
    ...SHARED_ENDING_SLIDES,
    SHARED_ENDING_QUIZ_GROUP,
    ...SHARED_READY_SLIDES,
  ],

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET]: [
    ...SHARED_INTRO_SLIDES,
    SHARED_INTRO_QUIZ_GROUP,
    ...SHARED_COMMANDS_SLIDES_PART1,
    ...STORAGE_INTRO_ALWAYS,
    ...SHARED_COMMANDS_SLIDES_PART2,
    ...KEEP_STORE_ALWAYS,
    ...SHARED_COMMANDS_SLIDES_PART3,
    SHARED_COMMANDS_QUIZ_GROUP,
    ...ABUND_DEPR_SLIDES,
    ABUND_DEPR_QUIZ_GROUP,
    ...SHARED_ENDING_SLIDES,
    SHARED_ENDING_QUIZ_GROUP,
    ...SHARED_READY_SLIDES_STORAGE,
  ],

  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE]: [
    ...SHARED_INTRO_SLIDES,
    SHARED_INTRO_QUIZ_GROUP,
    ...SHARED_COMMANDS_SLIDES_PART1,
    ...STORAGE_INTRO_ALWAYS,
    ...SHARED_COMMANDS_SLIDES_PART2,
    ...KEEP_STORE_ALWAYS,
    ...SHARED_COMMANDS_SLIDES_PART3,
    SHARED_COMMANDS_QUIZ_GROUP,
    ...SHARED_ENDING_SLIDES,
    SHARED_ENDING_QUIZ_GROUP,
    ...SHARED_READY_SLIDES_STORAGE,
  ],
  [GAME_VERSIONS.ONE_VIAL_ALWAYS_BUCKET_SIMPLE_FAST]: [
    ...SHARED_INTRO_SLIDES,
    SHARED_INTRO_QUIZ_GROUP,
    ...SHARED_COMMANDS_SLIDES_PART1,
    ...STORAGE_INTRO_ALWAYS,
    ...SHARED_COMMANDS_SLIDES_PART2,
    ...KEEP_STORE_ALWAYS,
    ...SHARED_COMMANDS_SLIDES_PART3,
    SHARED_COMMANDS_QUIZ_GROUP,
    ...SHARED_ENDING_SLIDES,
    SHARED_ENDING_QUIZ_GROUP,
    ...SHARED_READY_SLIDES_STORAGE,
  ],

  // [GAME_VERSIONS.TWO_VIALS_SINGLE_BUCKET]: [
  //   ...SHARED_INTRO_SLIDES,
  //   SHARED_INTRO_QUIZ_GROUP,
  //   ...SHARED_COMMANDS_SLIDES,
  //   SHARED_COMMANDS_QUIZ_GROUP,
  //   ...TWO_VIAL_ENDING_SLIDES,
  //   SHARED_ENDING_QUIZ_GROUP,
  //   ...SHARED_READY_SLIDES,
  // ],

  // [GAME_VERSIONS.TWO_VIALS_PHASES]: [
  //   ...SHARED_INTRO_SLIDES,
  //   ...SHARED_MECHANICS_SLIDES,
  //   ...SHARED_QUIZ_SLIDES,
  //   ...TWO_VIALS_PHASES_SPECIFIC,
  //   ...SHARED_ENDING_SLIDES,
  // ],
};

/**
 * Get tutorial slides for a specific game version.
 * Quiz groups are kept as single entries in the sequence; the tutorial
 * component is responsible for iterating through group.quizzes and
 * redirecting to group.returnToSlide if any answer was wrong.
 *
 * @param {string} gameVersion - The game version identifier
 * @returns {Array} Array of slide/quizGroup objects
 */
export const getTutorialSlides = (gameVersion) => {
  const slides = VERSION_SLIDE_SEQUENCES[gameVersion];

  if (!slides) {
    console.warn(
      `No tutorial slides found for version: ${gameVersion}. Using default.`,
    );
    return VERSION_SLIDE_SEQUENCES[GAME_VERSIONS.ONE_VIAL_ALTERNATING];
  }

  return slides.map((slide, index) => ({
    ...slide,
    numericId: index + 1,
  }));
};

/**
 * Helper to get slide index by string ID (useful for quizGroup returnToSlide).
 * @param {Array} slides - Array of slides/groups
 * @param {string} slideId - String ID to find
 * @returns {number} Index of the matching slide
 */
export const getSlideIndexById = (slides, slideId) => {
  const index = slides.findIndex((slide) => slide.id === slideId);
  return index >= 0 ? index : 0;
};
