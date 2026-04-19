const fs = require("fs");
const path = require("path");
const { execFileSync, spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const lockPath = path.join(projectRoot, ".next", "dev", "lock");

function removeLockFile() {
  try {
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      console.log("Removed stale Next.js dev lock.");
    }
  } catch (error) {
    console.warn("Could not remove Next.js dev lock:", error.message);
  }
}

function stopStaleFrontendProcesses() {
  if (process.platform !== "win32") {
    return;
  }

  try {
    execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        path.join(__dirname, "cleanup-dev.ps1"),
        projectRoot,
      ],
      { stdio: "ignore" },
    );
  } catch {
    // Ignore when no stale frontend process is found.
  }
}

removeLockFile();
stopStaleFrontendProcesses();

const child = spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true,
  cwd: projectRoot,
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
