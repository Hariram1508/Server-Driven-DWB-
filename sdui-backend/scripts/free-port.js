/* eslint-disable no-console */
const { execSync } = require("child_process");

const portArg = process.argv[2];
const port = Number.parseInt(portArg || "5001", 10);

if (!Number.isInteger(port) || port <= 0) {
  console.error("Invalid port. Usage: node scripts/free-port.js <port>");
  process.exit(1);
}

function killOnWindows(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    });

    const pids = new Set();
    for (const line of output.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const cols = trimmed.split(/\s+/);
      const pid = cols[cols.length - 1];
      if (/^\d+$/.test(pid)) pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`Freed port ${targetPort} by stopping PID ${pid}`);
      } catch {
        // Ignore individual taskkill failures
      }
    }
  } catch {
    // No process is using the port
  }
}

function killOnUnix(targetPort) {
  try {
    const output = execSync(`lsof -ti:${targetPort}`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    });

    const pids = output
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter((v) => /^\d+$/.test(v));

    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGKILL");
        console.log(`Freed port ${targetPort} by stopping PID ${pid}`);
      } catch {
        // Ignore individual kill failures
      }
    }
  } catch {
    // No process is using the port
  }
}

if (process.platform === "win32") {
  killOnWindows(port);
} else {
  killOnUnix(port);
}
