/**
 * Add polyfill for a Promise object
 */
import Promise from 'promise-polyfill';

window.Promise = window.Promise || Promise;
