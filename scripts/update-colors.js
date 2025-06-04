// scripts/update-colors.js
// Quick script to update all color classes to black/orange theme

const fs = require('fs');
const path = require('path');

// Color mappings
const colorReplacements = {
  // Backgrounds
  'bg-gray-950': 'bg-black',
  'bg-gray-900': 'bg-neutral-900',
  'bg-gray-800': 'bg-neutral-800',
  'bg-gray-700': 'bg-neutral-700',
  'bg-gray-600': 'bg-neutral-600',
  
  // Borders
  'border-gray-800': 'border-neutral-800',
  'border-gray-700': 'border-neutral-700',
  'border-gray-600': 'border-neutral-600',
  
  // Text colors
  'text-gray-400': 'text-neutral-400',
  'text-gray-500': 'text-neutral-500',
  'text-gray-600': 'text-neutral-600',
  
  // Blues to Orange
  'bg-blue-500': 'bg-orange-500',
  'bg-blue-600': 'bg-orange-600',
  'bg-blue-400': 'bg-orange-400',
  'hover:bg-blue-500': 'hover:bg-orange-500',
  'hover:bg-blue-600': 'hover:bg-orange-600',
  'text-blue-400': 'text-orange-400',
  'text-blue-500': 'text-orange-500',
  'border-blue-500': 'border-orange-500',
  'focus:border-blue-500': 'focus:border-orange-500',
  
  // Gradients
  'from-blue-500': 'from-orange-500',
  'from-blue-600': 'from-orange-600',
  'to-purple-500': 'to-orange-600',
  'to-purple-600': 'to-orange-700',
  'via-purple-600': 'via-orange-600',
  
  // Special backgrounds
  'bg-gray-900/50': 'bg-neutral-900/50',
  'bg-gray-900/30': 'bg-neutral-900/30',
  'bg-gray-900/70': 'bg-neutral-900/70',
  'bg-gray-800/50': 'bg-neutral-800/50',
  'bg-gray-800/30': 'bg-neutral-800/30',
  'hover:bg-gray-800/50': 'hover:bg-neutral-800/50',
  
  // Hover states
  'hover:bg-gray-700': 'hover:bg-neutral-700',
  'hover:bg-gray-800': 'hover:bg-neutral-800',
  'hover:bg-gray-600': 'hover:bg-neutral-600',
  
  // Special cases for blue/purple to orange
  'bg-blue-500/20': 'bg-orange-500/20',
  'bg-blue-500/10': 'bg-orange-500/10',
  'bg-blue-500/5': 'bg-orange-500/5',
  'border-blue-500/30': 'border-orange-500/30',
  
  // Keep some grays for better contrast
  'bg-gray-900/50 backdrop-blur-sm': 'bg-black/80 backdrop-blur-sm',
};

// Files to update
const filesToUpdate = [
  'src/components/SampleBrowser.tsx',
  'src/components/AuthModal.tsx',
  'src/components/EmailCaptureModal.tsx',
  'src/components/ProducerDashboard.tsx',
  'src/components/AdminGuard.tsx',
  'src/app/admin/upload/page.tsx',
  'src/app/library/page.tsx',
  'src/app/success/page.tsx',
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // Apply replacements
    Object.entries(colorReplacements).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      updatedContent = updatedContent.replace(regex, newColor);
    });
    
    // Write back if changed
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log('🎨 Updating color scheme to Black/Orange...\n');

filesToUpdate.forEach(file => {
  updateFile(path.join(process.cwd(), file));
});

console.log('\n✨ Color update complete!');
console.log('🔥 Your platform now has a sleek black/orange theme');
console.log('\n📝 Next steps:');
console.log('1. Review the changes');
console.log('2. Run: npm run dev');
console.log('3. Commit: git add . && git commit -m "Update UI to black/orange theme"');
console.log('4. Push: git push');