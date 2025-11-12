/**
 * Validation script for Netflix-like features error handling
 * Tests the error handling and graceful degradation functionality
 */

// Mock console to capture logs
const logs = [];
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

console.log = (...args) => {
  logs.push({ type: 'log', args });
  originalConsole.log(...args);
};

console.warn = (...args) => {
  logs.push({ type: 'warn', args });
  originalConsole.warn(...args);
};

console.error = (...args) => {
  logs.push({ type: 'error', args });
  originalConsole.error(...args);
};

// Import the episode metadata functions
const { 
  getEpisodeMetadata, 
  getNextEpisode, 
  getMovieMetadata,
  getIntroTiming 
} = require('./src/lib/episode-metadata.ts');

async function testErrorHandling() {
  console.log('🎬 Testing Netflix-like Features Error Handling\n');

  // Test 1: Invalid episode ID
  console.log('Test 1: Invalid episode ID');
  try {
    const result = await getEpisodeMetadata(null);
    console.log('Result:', result);
  } catch (error) {
    console.error('Caught error:', error.message);
  }

  // Test 2: Non-existent episode
  console.log('\nTest 2: Non-existent episode');
  try {
    const result = await getEpisodeMetadata('non-existent-episode');
    console.log('Result:', result);
  } catch (error) {
    console.error('Caught error:', error.message);
  }

  // Test 3: Invalid movie ID
  console.log('\nTest 3: Invalid movie ID');
  try {
    const result = await getMovieMetadata('');
    console.log('Result:', result);
  } catch (error) {
    console.error('Caught error:', error.message);
  }

  // Test 4: Invalid content type for intro timing
  console.log('\nTest 4: Invalid content type for intro timing');
  try {
    const result = await getIntroTiming('episode-1', 'invalid-type');
    console.log('Result:', result);
  } catch (error) {
    console.error('Caught error:', error.message);
  }

  // Test 5: Valid episode (should work)
  console.log('\nTest 5: Valid episode (should work)');
  try {
    const result = await getEpisodeMetadata('episode-1');
    console.log('Result:', result ? 'Success - ' + result.title : 'null');
  } catch (error) {
    console.error('Caught error:', error.message);
  }

  // Test 6: Valid movie (should work)
  console.log('\nTest 6: Valid movie (should work)');
  try {
    const result = await getMovieMetadata('movie-1');
    console.log('Result:', result ? 'Success - ' + result.title : 'null');
  } catch (error) {
    console.error('Caught error:', error.message);
  }

  // Analyze logs
  console.log('\n🎬 Error Handling Analysis:');
  const errorLogs = logs.filter(log => log.type === 'error');
  const warnLogs = logs.filter(log => log.type === 'warn');
  const infoLogs = logs.filter(log => log.args[0] && log.args[0].includes('🎬'));

  console.log(`- Error logs: ${errorLogs.length}`);
  console.log(`- Warning logs: ${warnLogs.length}`);
  console.log(`- Info logs: ${infoLogs.length}`);

  console.log('\n✅ Error handling validation complete!');
  
  // Restore console
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testErrorHandling().catch(console.error);
}

module.exports = { testErrorHandling };