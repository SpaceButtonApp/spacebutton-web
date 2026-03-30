import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const sourceDir = '/vercel/share/v0-project/spacebutton-mobile';
const outputDir = '/vercel/share/v0-project/public';
const zipName = 'spacebutton-mobile.zip';

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Create ZIP file
const outputPath = path.join(outputDir, zipName);

try {
  // Remove existing zip if present
  execSync(`rm -f ${outputPath}`);
  
  // Create zip file
  execSync(`cd /vercel/share/v0-project && zip -r ${outputPath} spacebutton-mobile -x "*.DS_Store" -x "*node_modules*" -x "*.expo*"`);
  
  console.log(`ZIP file created successfully at: ${outputPath}`);
  console.log(`Download URL: /spacebutton-mobile.zip`);
} catch (error) {
  console.error('Error creating ZIP:', error.message);
  process.exit(1);
}
