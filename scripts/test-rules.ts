import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

console.log('Successfully imported @firebase/rules-unit-testing!');
console.log('initializeTestEnvironment:', typeof initializeTestEnvironment);
console.log('assertFails:', typeof assertFails);
console.log('assertSucceeds:', typeof assertSucceeds);
