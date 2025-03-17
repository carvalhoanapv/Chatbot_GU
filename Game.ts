import { createMachine, assign, interpret } from 'xstate';
import axios from 'axios';

interface GameContext {
  famousPeople: { name: string; hints: string[] }[];
  currentPersonIndex: number;
  currentHintIndex: number;
  attempts: number;
  score: number;
}

const getFamousPeople = () => [
  { name: "Albert Einstein", hints: ["Let’s break this down to the atomic level.", "He developed the theory of relativity.", "E = mc²"] },
  { name: "Walter White", hints: ["Say my name.", "I am the one who knocks.", "Let's cook."] },
  { name: "Marie Curie", hints: ["She discovered radioactivity.", "She was the first woman to win a Nobel Prize.", "She worked with radium and polonium."] },
  { name: "Leonardo da Vinci", hints: ["He painted the Mona Lisa.", "He was also an inventor and scientist.", "He lived during the Renaissance."] },
  { name: "Santos Dumont", hints: ["He was a pioneer in aviation.", "He created the first airplane.", "He created the wrist watch that was named after him, Cartier Santos-Dumont."] },
  { name: "Isaac Newton", hints: ["He formulated the laws of motion.", "He discovered gravity.", "He wrote 'Principia Mathematica'."] },
  { name: "Nikola Tesla", hints: ["He worked with electricity.", "He was known for alternating current (AC).", "He had a rivalry with Thomas Edison."] },
  { name: "Charles Darwin", hints: ["He developed the theory of evolution.", "He wrote 'On the Origin of Species'.", "He traveled on the HMS Beagle."] },
  { name: "Pelé", hints: ["He was a Brazilian footballer.", "He won the Ballon d'Or in 1962.", "He played for the Brazil national team."] },
  { name: "Shakespeare", hints: ["He wrote 'Romeo and Juliet'.", "He was an English playwright.", "He lived during the Elizabethan era."] },
  { name: "Paulo Coelho", hints: ["He is a Brazilian novelist'.", "His most famous book is The Alchemist.", "He often writes about self-discovery and personal legends."] },
  { name: "Mary Shelley", hints: ["She wrote Frankenstein.", "She is considered one of the first science fiction novels.", "Her contributions to literature influenced the Gothic and horror genres."] },
  { name: "Frida Kahlo", hints: ["She painted many self-portraits.", "She was severely injured in a bus accident, which influenced her art.","She was married to the Mexican muralist Diego Rivera."] },
  { name: "Tom Jobim", hints: ["He was one of the creators of Bossa Nova music.", "He composed 'Garota de Ipanema' or 'The Girl from Ipanema'.", "His music blended Brazilian rhythms with jazz influences."] },
  { name: "Rosa Parks", hints: ["She refused to give up her bus seat in Montgomery, Alabama.", "She is responsible for an act of defiance which became a key moment in the Civil Rights Movement.", "She worked with Martin Luther King Jr. to fight racial segregation."] },
  { name: "Grace Hopper", hints: ["She was a U.S. Navy Rear Admiral and a pioneer in computer programming.", "She developed the first compiler for a programming language.","She popularized the term 'debugging' after removing a moth from a computer."] },
  { name: "Monty Python", hints: ["They were a British comedy group.", "A TV show is named after them.", "They were responsible for many classic comedy sketches."] },
  { name: "Ada Lovelace", hints: ["She was one of the first programmers.", "She is considered the first computer programmer.", "She was a mathematician and writer."] },
  { name: "Fernanda Torres", hints: ["She is a Brazilian actress.", "She won a Golden Globe Award for Best Actress in 2025.", "The movie she plays the main character won an Oscar for best international movie in 2025."] },
];




const recognizeIntent = async (input: string) => {
  const response = await axios.post(
    'https://your-azure-endpoint/cognitiveservices/v1',
    { text: input },
    {
      headers: {
        'Ocp-Apim-Subscription-Key': 'YOUR_AZURE_KEY',
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.topScoringIntent.intent;
};

const gameMachine = createMachine<GameContext>(
  {
    id: 'guessGame',
    initial: 'idle',
    context: {
      famousPeople: getFamousPeople(),
      currentPersonIndex: 0,
      currentHintIndex: 0,
      attempts: 0,
      score: 0
    },
    states: {
      idle: {
        on: { START: 'speak', EXIT: 'gameOver' }
      },
      speak: {
        entry: assign((context) => ({ currentHintIndex: 0, attempts: 0 })),
        on: { LISTEN: 'listen', EXIT: 'gameOver' }
      },
      listen: {
        on: { PROCESS_ANSWER: 'checkingAnswer', EXIT: 'gameOver' }
      },
      checkingAnswer: {
        invoke: {
          src: (context, event) => recognizeIntent(event.answer),
          onDone: [
            {
              cond: (context, event) => event.data === context.famousPeople[context.currentPersonIndex].name,
              target: 'correctAnswer'
            },
            { target: 'wrongAnswer' }
          ]
        }
      },
      correctAnswer: {
        entry: assign((context) => ({ score: context.score + 10 })),
        entry: (context) => {
          const responses = [
            "Genius is 1% talent and 99% hard work. You nailed it!",
            "Eureka! Even Archimedes would be jealous.",
            "I respect the science—and I respect your answer.",
            "You are not in danger, you are the danger! Good job!",
            "Two things are infinite: the universe and your potential. Well done!",
            "Correct! Consider that a quantum leap forward."
          ];
          console.log(responses[Math.floor(Math.random() * responses.length)]);
        },
        on: {
          NEXT_ROUND: [
            {
              cond: (context) => context.currentPersonIndex < context.famousPeople.length - 1,
              actions: assign((context) => ({ currentPersonIndex: context.currentPersonIndex + 1 })),
              target: 'speak'
            },
            { target: 'gameOver' }
          ]
        }
      },
      wrongAnswer: {
        entry: assign((context) => ({ attempts: context.attempts + 1 })),
        entry: (context) => {
          const responses = [
            "It’s not that I’m so smart; it’s just that I stay with problems longer. So, try again.",
            "Anyone who has never made a mistake has never tried anything new.",
            "Failure is success in progress. Want to try a different approach?",
            "Don’t worry about mistakes. Worry about what you learn from them."
          ];
          console.log(responses[Math.floor(Math.random() * responses.length)]);
        },
        always: [
          { cond: (context) => context.attempts >= 3, target: 'gameOver' },
          { target: 'speak' }
        ]
      },
      gameOver: {
        type: 'final',
        entry: () => {
          const responses = [
            "That was fun. But don’t think for a second that you’ve mastered history. Next time, I’ll bring the real challenge.",
            "You won today. Tomorrow... well, that’s another story.",
            "You’ve learned a lot. But knowledge is infinite—so is the game."
          ];
          console.log(responses[Math.floor(Math.random() * responses.length)]);
        }
      }
    }
  }
);

const gameService = interpret(gameMachine).start();

export default gameService;
