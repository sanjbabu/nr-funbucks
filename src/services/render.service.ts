import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';

import {CONFIG_BASEPATH, OUTPUT_BASEPATH, TEMPLATE_CONFIG_BASEPATH} from '../constants/paths';
import {BaseConfig, FbFile, ServerAppConfig, ServerConfig, TypeConfig} from '../util/types';

export class RenderService {
  /**
   * Base config
   */
  private baseConfig: BaseConfig = {
    context: {},
    localContextOverride: {},
    files: [],
  };

  /**
   * Context override values
   */
  private baseContextOverride: object = {};

  /**
   * Keeps count of times a type has been created.
   */
  private typeCnt: {
    [type: string]: number
  } = {};

  /**
   * Keeps track of files.
   */
  private typeFiles: {
    [type: string]: string[]
  } = {};

  /**
   * Keeps track of types of each measurement.
   */
  private measureTypes: {
    historic: string[];
    instant: string[];
  } = {
    'historic': [],
    'instant': [],
  };

  public async init(local: boolean) {
    nunjucks.configure(TEMPLATE_CONFIG_BASEPATH, {
      autoescape: true,
    });
    return Promise.all([
      this.clean(),
      this.readBaseConfig(local)]);
  }

  public clean(): Promise<void> {
    fs.rmSync(OUTPUT_BASEPATH, {recursive: true, force: true});
    fs.mkdirSync(OUTPUT_BASEPATH);
    return Promise.resolve();
  }

  public readBaseConfig(local: boolean): Promise<void> {
    const baseConfigStr = fs.readFileSync(path.resolve(CONFIG_BASEPATH, `base.json`), 'utf8');
    this.baseConfig = JSON.parse(baseConfigStr);
    if (local) {
      this.baseContextOverride = this.baseConfig.localContextOverride;
    }
    return Promise.resolve();
  }

  public writeBase() {
    const context = {
      ...this.baseConfig.context,
      ...this.baseContextOverride,
      ...this.collateFileType('parser'),
      ...this.collateFileType('filter'),
      ...this.collateFileType('input'),
      measureTypes: this.measureTypes,
    };
    for (const file of this.baseConfig.files) {
      this.writeRenderedTemplate(file.tmpl, this.fileToOutputPath(file), context);
    }
  }

  public writeApp(app: ServerAppConfig, serverConfig: ServerConfig) {
    const typeConfigPath = path.resolve(TEMPLATE_CONFIG_BASEPATH, app.type, `${app.type}.json`);
    const typeConfigStr = fs.readFileSync(typeConfigPath, 'utf8');
    const type: TypeConfig = JSON.parse(typeConfigStr);

    this.writeType(app, type, serverConfig);
  }

  private writeType(
    app: ServerAppConfig,
    type: TypeConfig,
    serverConfig: ServerConfig) {
    const context = {...type.context, ...app.context};
    this.typeCnt[app.type] = this.typeCnt[app.type] ? this.typeCnt[app.type] + 1 : 1;
    const typeTag = app.id ? app.id : `${app.type}_${this.typeCnt[app.type]}`;
    this.measureTypes[type.measurementType].push(typeTag);
    for (const file of type.files) {
      const outPath = this.writeRenderedTemplate(
        `${app.type}/${file.tmpl}`,
        `${typeTag}/${this.fileToOutputPath(file)}`,
        {
          typeTag,
          ...this.baseConfig.context,
          ...serverConfig.context,
          ...this.baseContextOverride,
          ...context,
        });

      if (file.type === 'script') {
        fs.chmodSync(outPath, 0o775);
      }
      this.addFileToType(app, file, outPath);
    }
  }

  private execValueTemplate(context: {[key: string]: string}): object {
    for (const key of Object.keys(context)) {
      if (key && key.length > 1 && key.startsWith('!')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        context[key.slice(1)] = nunjucks.renderString(context[key], context);
      }
    }
    return context;
  }

  private collateFileType(fileType: string): object {
    return {
      [`files_${fileType}`]: this.typeFiles[fileType] ? this.typeFiles[fileType] : [],
    };
  }

  private addFileToType(app: ServerAppConfig, file: FbFile, outPath: string) {
    if (!this.typeFiles[file.type]) {
      this.typeFiles[file.type] = [];
    }
    this.typeFiles[file.type].push(outPath.slice(OUTPUT_BASEPATH.length + 1));
  }

  private writeRenderedTemplate(templateName: string, outputPath: string, context: object): string {
    const outPath = path.resolve(OUTPUT_BASEPATH, outputPath);
    fs.mkdirSync(path.dirname(outPath), {recursive: true});
    if (this.isTemplateNjkFile(templateName)) {
      const txt = nunjucks.render(templateName, this.execValueTemplate(context as {[key: string]: string}));
      fs.writeFileSync(outPath, txt);
    } else {
      const txt = fs.readFileSync(path.resolve(TEMPLATE_CONFIG_BASEPATH, templateName));
      fs.writeFileSync(outPath, txt);
    }
    return outPath;
  }

  private fileToOutputPath(file: FbFile): string {
    if (file.name !== undefined) {
      return file.name;
    } else if (this.isTemplateNjkFile(file.tmpl)) {
      return file.tmpl.substring(0, file.tmpl.length - 4);
    } else {
      return file.tmpl;
    }
  }

  private isTemplateNjkFile(path: string): boolean {
    return path.endsWith('.njk');
  }
}
