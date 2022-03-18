export type FB_FILE_TYPES = 'input' | 'script' | 'filter' | 'parser' | 'lua';

export interface FbFile {
  name?: string;
  tmpl: string;
  type: FB_FILE_TYPES;
}

export type MEASURE_TYPES = {
  historic: string;
  instant: string;
}

export interface TypeConfig {
  context: object;
  files: FbFile[];
  measurementType: keyof MEASURE_TYPES;
}

export interface ServerAppConfig {
  id: string;
  type: string;
  context: object;
}

export interface ServerConfig {
  address: string;
  apps: ServerAppConfig[];
  context: object;
}

export interface BaseConfig {
  context: object;
  localContextOverride: object;
  files: FbFile[];
}
