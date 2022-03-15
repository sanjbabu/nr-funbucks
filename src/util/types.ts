
export interface FbFile {
  name?: string;
  tmpl: string;
  type: 'script' | 'filter' | 'parser' | 'lua';
}

export interface TypeConfig {
  context: object;
  files: FbFile[]
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
