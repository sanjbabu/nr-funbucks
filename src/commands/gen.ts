import {Command, Flags} from '@oclif/core';

import * as fs from 'fs';
import * as path from 'path';
import {RenderService} from '../services/render.service';
import {ServerConfig} from '../util/types';
import {SERVER_CONFIG_BASEPATH} from '../constants/paths';

export default class Gen extends Command {
  static description = 'generate fluentbit configuration'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    server: Flags.string({char: 's', required: true, description: 'server to render the config for'}),
    local: Flags.boolean({char: 'l', description: 'render for local lambda usage'}),
    app: Flags.string({char: 'a', description: 'app to limit rendering to'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Gen);
    const service = new RenderService();

    await service.init(flags.local);

    const serverConfigStr = fs.readFileSync(path.resolve(SERVER_CONFIG_BASEPATH, `${flags.server}.json`), 'utf8');
    const serverConfig: ServerConfig = JSON.parse(serverConfigStr);

    for (const app of serverConfig.apps) {
      if (flags.app === undefined || flags.app === app.id) {
        service.writeApp(app, serverConfig);
      }
    }
    service.writeBase();
  }
}
