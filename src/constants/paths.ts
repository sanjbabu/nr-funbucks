import * as path from 'path';

export const CONFIG_BASEPATH = path.resolve(__dirname, '../../config');
export const SERVER_CONFIG_BASEPATH = path.resolve(CONFIG_BASEPATH, 'server');
export const TEMPLATE_CONFIG_BASEPATH = path.resolve(CONFIG_BASEPATH, 'templates');
export const OUTPUT_BASEPATH = path.resolve(__dirname, '../../output');
