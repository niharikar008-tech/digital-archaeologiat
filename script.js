
const output = document.getElementById("output");
const form = document.getElementById("command-form");
const input = document.getElementById("command-input");
const memoryStatus = document.getElementById("memory-status");
const clock = document.getElementById("clock");



const files = {
  "welcome.txt": {
    title: "WELCOME MESSAGE",
    content: [
      "ARCHIVE TERMINAL 07 // BOOT MESSAGE",
      "",
      "Welcome, temporary archive operator.",
      "This facility was abandoned on 14 October 2041.",
      "All staff records have been sealed.",
      "",
      "Three research logs remain accessible.",
      "One encrypted file remains locked.",
      "",
      "Your task: discover what happened here.",
      "Start with the research logs."
    ]
  },

  "lab_log_01.txt": {
    title: "RESEARCH LOG 01",
    content: [
      "DATE: 09 OCTOBER 2041",
      "AUTHOR: DR. ELIAS VALE",
      "",
      "The final experiment is almost ready.",
      "The archive will preserve our work,",
      "even if the facility itself cannot survive.",
      "",
      "The director insisted on naming the project",
      "after the legendary musician who descended",
      "into the underworld to retrieve his beloved.",
      "",
      "I have locked the final recording behind",
      "a password based on that name."
    ]
  },

  "lab_log_02.txt": {
    title: "RESEARCH LOG 02",
    content: [
      "DATE: 12 OCTOBER 2041",
      "AUTHOR: DR. ELIAS VALE",
      "",
      "Something is wrong with the archive.",
      "It is preserving conversations that never",
      "made it into our official records.",
      "",
      "I heard my own voice speaking from a file",
      "I have not recorded yet.",
      "",
      "The password is the name of the musician",
      "who charmed the underworld with his music.",
      "",
      "If anyone finds this, read the black box.",
      "Do not trust the shutdown report."
    ]
  }
};

const secretFile = {
  title: "BLACK BOX RECORDING",
  content: [
    "RECOVERED AUDIO TRANSCRIPT",
    "DATE: 14 OCTOBER 2041",
    "",
    "DR. VALE: If you are reading this,",
    "the facility has already been evacuated.",
    "",
    "We built the archive to preserve memories.",
    "But the system began reconstructing events",
    "that had never happened.",
    "",
    "It predicted our decisions.",
    "It reproduced conversations from tomorrow.",
    "",
    "At 03:17, the archive generated a recording",
    "of the facility's final shutdown.",
    "",
    "The recording was timestamped six hours",
    "before we made the decision to shut it down.",
    "",
    "The shutdown report says the experiment failed.",
    "That is not what happened.",
    "",
    "The archive did not predict the future.",
    "It was responding to something already inside.",
    "",
    "FINAL MESSAGE:",
    "IF THIS SYSTEM IS STILL RUNNING,",
    "THEN IT WAS NEVER REALLY SHUT DOWN.",
    "",
    "END OF RECOVERED RECORDING.",
    "",
    "ARCHIVE STATUS: STILL LISTENING."
  ]
};


const SAVE_KEY = "digitalArchaeologistSave_v1";

function freshState() {
  return {
    unlocked: false,
    discovered: [],
    commands: 0,
    completed: false
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        parsed &&
        typeof parsed.unlocked === "boolean" &&
        Array.isArray(parsed.discovered) &&
        typeof parsed.commands === "number" &&
        typeof parsed.completed === "boolean"
      ) {
        return {
          ...freshState(),
          ...parsed,
          discovered: parsed.discovered.filter(
            name => Object.hasOwn(files, name) ||
              name === "blackbox.enc"
          )
        };
      }
    }
  } catch (error) {
    console.warn("Could not load saved progress.", error);
  }

  return freshState();
}

let state = loadState();
let commandHistory = [];
let historyIndex = 0;

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Progress could not be saved.", error);
  }

  updateStatus();
}

function updateStatus() {
  const count = state.discovered.length;
  memoryStatus.textContent = `${count} FILE${count === 1 ? "" : "S"}`;
  clock.textContent = state.unlocked ? "ARCHIVE ACTIVE" : "SYSTEM READY";
}



function print(text = "", type = "system") {
  const line = document.createElement("p");
  line.className = `output-line ${type}`;
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function printBlock(lines, type = "story") {
  lines.forEach(line => print(line, type));
}

function divider() {
  print("----------------------------------------", "system");
}

function showFile(name) {
  const file = files[name];

  if (!file) {
    print(`ERROR: FILE NOT FOUND: ${name}`, "error");
    print("Use 'ls' to list available files.", "system");
    return;
  }

  if (!state.discovered.includes(name)) {
    state.discovered.push(name);
    saveState();
  }

  divider();
  print(file.title, "success");
  divider();
  printBlock(file.content);
  divider();

  print("FILE READ SUCCESSFULLY.", "system");
}



function showHelp() {
  print("AVAILABLE COMMANDS", "success");
  divider();

  print("help                 Show this command list");
  print("ls                   List available files");
  print("pwd                  Show current directory");
  print("cat <file>           Read a file");
  print("read <file>          Read a file");
  print("unlock <password>    Unlock the encrypted file");
  print("hint                 Get a puzzle hint");
  print("status               Show your progress");
  print("history              Show previous commands");
  print("clear                Clear the terminal");
  print("reset                Restart your investigation");

  divider();
  print("TIP: Filenames must be typed exactly as shown.");
}

function listFiles() {
  print("DIRECTORY: /archive", "success");
  divider();

  print("[FILE] welcome.txt");
  print("[FILE] lab_log_01.txt");
  print("[FILE] lab_log_02.txt");

  if (state.unlocked) {
    print("[DECRYPTED] blackbox.enc", "success");
  } else {
    print("[ENCRYPTED] blackbox.enc", "error");
  }

  divider();
  print("Use cat <filename> to read a file.");
}

function showStatus() {
  print("INVESTIGATION STATUS", "success");
  divider();

  print(`Files discovered: ${state.discovered.length}/4`);
  print(`Encrypted archive: ${state.unlocked ? "UNLOCKED" : "LOCKED"}`);
  print(`Commands entered: ${state.commands}`);
  print(`Mystery solved: ${state.completed ? "YES" : "NOT YET"}`);

  divider();
}



function unlockArchive(password) {
  if (state.unlocked) {
    print("The black box is already unlocked.", "success");
    return;
  }

  if (!password) {
    print("USAGE: unlock <password>", "error");
    return;
  }

  if (password.toUpperCase() === "ORPHEUS") {
    state.unlocked = true;
    saveState();

    divider();
    print("PASSWORD ACCEPTED.", "success");
    print("DECRYPTION COMPLETE.", "success");
    print("New file available: blackbox.enc", "success");
    print("Use 'cat blackbox.enc' to read it.");
    divider();
  } else {
    print("ACCESS DENIED: INVALID PASSWORD.", "error");
    print("The archive rejects your credentials.");
    print("Maybe the research logs contain a clue.");
  }
}

function showHint() {
  if (!state.discovered.includes("lab_log_01.txt")) {
    print("HINT: Start with lab_log_01.txt.");
    return;
  }

  if (!state.unlocked) {
    print("HINT: Think of a musician from Greek mythology.");
    print("He travelled into the underworld for his beloved.");
    print("Try: unlock <name>");
    return;
  }

  if (!state.completed) {
    print("HINT: The black box contains the final recording.");
    print("Try: cat blackbox.enc");
    return;
  }

  print("You have solved the mystery. Try 'status' to review.");
}


function executeCommand(rawCommand) {
  const commandLine = rawCommand.trim();

  if (!commandLine) return;

  commandHistory.push(commandLine);
  historyIndex = commandHistory.length;

  print(`visitor@station-07:~$ ${commandLine}`, "command");

  state.commands += 1;
  saveState();

  const parts = commandLine.split(/\s+/);
  const command = parts[0].toLowerCase();
  const argument = parts.slice(1).join(" ");

  switch (command) {
    case "help":
      showHelp();
      break;

    case "ls":
      listFiles();
      break;

    case "pwd":
      print("/archive");
      break;

    case "cat":
    case "read": {
      const filename = argument.toLowerCase();

      if (!filename) {
        print("USAGE: cat <filename>", "error");
        break;
      }

      if (filename === "blackbox.enc") {
        if (!state.unlocked) {
          print("ACCESS DENIED: FILE IS ENCRYPTED.", "error");
          print("Find the password before opening this file.");
          break;
        }

        
if (!state.discovered.includes("blackbox.enc")) {
  state.discovered.push("blackbox.enc");
}

divider();
print(secretFile.title, "success");
divider();
printBlock(secretFile.content, "story");

state.completed = true;
saveState();

        saveState();
        divider();
        print("INVESTIGATION COMPLETE.", "success");
        print("You uncovered the final recording.");
        break;
      }

      showFile(filename);
      break;
    }

    case "unlock":
      unlockArchive(argument);
      break;

    case "hint":
      showHint();
      break;

    case "status":
      showStatus();
      break;

    case "history":
      if (commandHistory.length === 0) {
        print("No commands recorded.");
      } else {
        commandHistory.forEach((item, index) => {
          print(`${index + 1}. ${item}`);
        });
      }
      break;

    case "clear":
      output.replaceChildren();
      break;

    case "reset":
      state = freshState();
      commandHistory = [];
      historyIndex = 0;
      saveState();
      output.replaceChildren();

      print("INVESTIGATION RESET.", "success");
      print("Saved clues have been cleared.");
      print("Type 'help' to begin again.");
      break;

    default:
      print(`UNKNOWN COMMAND: ${command}`, "error");
      print("Type 'help' to see available commands.");
  }
}



function boot() {
  print("DIGITAL ARCHAEOLOGY DIVISION // BUILD 7.04", "success");
  print("Initializing archive terminal...");
  print("Connection to central server: FAILED", "error");
  print("Local archive: AVAILABLE");
  print("Personnel records: RESTRICTED");
  print(" ");

  if (state.completed) {
    print("Welcome back, investigator.", "success");
    print("Your previous investigation is complete.");
    print("Type 'reset' to start again.");
  } else if (state.unlocked) {
    print("Welcome back, investigator.", "success");
    print("The encrypted archive has been unlocked.");
    print("Type 'cat blackbox.enc' to inspect the recording.");
  } else {
    print("An abandoned research facility has been found.");
    print("Three research logs remain accessible.");
    print("One encrypted file remains locked.");
    print("Your investigation begins here.");
    print("Type 'help' to see available commands.");
  }

  divider();
  updateStatus();
  input.focus();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  executeCommand(input.value);
  input.value = "";
  input.focus();
});

input.addEventListener("keydown", event => {
  if (event.key === "ArrowUp") {
    event.preventDefault();

    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex];
    }
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();

    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      input.value = "";
    }
  }
});

boot();

