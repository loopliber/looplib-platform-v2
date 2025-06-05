// scripts/cleanup-samples.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupSamples() {
  try {
    console.log('🧹 Cleaning up all samples and related data...');
    
    // 1. Delete all user downloads first (foreign key constraint)
    const { error: downloadsError } = await supabase
      .from('user_downloads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (downloadsError) throw downloadsError;
    console.log('✅ User downloads cleared');
    
    // 2. Delete all user likes (if they exist)
    const { error: likesError } = await supabase
      .from('user_likes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (likesError && likesError.code !== '42P01') { // Ignore if table doesn't exist
      throw likesError;
    }
    console.log('✅ User likes cleared');
    
    // 3. Now delete all samples from database
    const { error: dbError } = await supabase
      .from('samples')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (dbError) throw dbError;
    console.log('✅ Database samples cleared');
    
    // 4. List all files in storage
    const { data: files, error: listError } = await supabase.storage
      .from('samples')
      .list();
    
    if (listError) throw listError;
    
    // 5. Delete all files from storage
    if (files && files.length > 0) {
      const filePaths = files.map(file => file.name);
      const { error: deleteError } = await supabase.storage
        .from('samples')
        .remove(filePaths);
      
      if (deleteError) throw deleteError;
      console.log(`✅ Deleted ${files.length} files from storage`);
    } else {
      console.log('✅ No files in storage to delete');
    }
    
    console.log('🎉 Complete cleanup finished! Ready for fresh upload.');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.log('💡 You can also delete manually from Supabase dashboard:');
    console.log('   1. Table Editor → user_downloads → Delete all');
    console.log('   2. Table Editor → samples → Delete all');
    console.log('   3. Storage → samples → Delete all files');
  }
}

cleanupSamples();