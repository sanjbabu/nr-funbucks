import * as path from 'path';

/**
 * Path to the configuration directory
 */
export const CONFIG_BASEPATH = path.resolve(__dirname, '../../config');
/**
 * Path to the server configurations in the config directory
 */
export const SERVER_CONFIG_BASEPATH = path.resolve(CONFIG_BASEPATH, 'server');
/**
 * Path to the type templates in the config directory
 */
export const TEMPLATE_CONFIG_BASEPATH = path.resolve(CONFIG_BASEPATH, 'templates');
/**
 * Default path to the output location
 */
export const OUTPUT_BASEPATH = path.resolve(__dirname, '../../output');
