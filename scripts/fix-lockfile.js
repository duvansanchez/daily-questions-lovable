import { execSync } from "child_process";

// Remove node_modules and package-lock.json, then reinstall
try {
  console.log("Removing package-lock.json...");
  execSync("rm -f /vercel/share/v0-project/package-lock.json", { stdio: "inherit" });
  
  console.log("Removing node_modules...");
  execSync("rm -rf /vercel/share/v0-project/node_modules", { stdio: "inherit" });
  
  console.log("Running npm install to regenerate lockfile...");
  execSync("cd /vercel/share/v0-project && npm install", { stdio: "inherit", timeout: 120000 });
  
  console.log("Done! Lockfile regenerated successfully.");
} catch (error) {
  console.error("Error:", error.message);
}
