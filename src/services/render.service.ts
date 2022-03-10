import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';

import {CONFIG_BASEPATH, OUTPUT_BASEPATH, TEMPLATE_CONFIG_BASEPATH} from '../constants/paths';
import {BaseConfig, FbFile, ServerAppConfig, TypeConfig} from '../util/types';

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
    };
    for (const file of this.baseConfig.files) {
      this.writeRenderedTemplate(file.tmpl, this.fileToOutputPath(file), context);
    }
  }

  public writeApp(app: ServerAppConfig) {
    const typeConfigPath = path.resolve(TEMPLATE_CONFIG_BASEPATH, app.type, `${app.type}.json`);
    const typeConfigStr = fs.readFileSync(typeConfigPath, 'utf8');
    const type: TypeConfig = JSON.parse(typeConfigStr);

    this.writeType(app, type);
  }

  private writeType(
    app: ServerAppConfig,
    type: TypeConfig) {
    const context = {...type.context, ...app.context};
    this.typeCnt[app.type] = this.typeCnt[app.type] ? this.typeCnt[app.type] + 1 : 1;
    const typeTag = app.id ? app.id : `${app.type}_${this.typeCnt[app.type]}`;

    for (const file of type.files) {
      const outPath = this.writeRenderedTemplate(
        `${app.type}/${file.tmpl}`,
        `${typeTag}/${this.fileToOutputPath(file)}`,
        {
          typeTag,
          ...this.baseConfig.context,
          ...this.baseContextOverride,
          ...context,
        });

      if (file.type === 'script') {
        fs.chmodSync(outPath, 0o775);
      }
      this.addFileToType(app, file, outPath);
    }
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
    const txt = nunjucks.render(templateName, context);
    const outPath = path.resolve(OUTPUT_BASEPATH, outputPath);
    fs.mkdirSync(path.dirname(outPath), {recursive: true});
    fs.writeFileSync(outPath, txt);
    return outPath;
  }

  private fileToOutputPath(file: FbFile): string {
    return file.name !== undefined ? file.name : file.tmpl.substring(0, file.tmpl.length - 4);
  }
}
