import {Command, Flags} from '@oclif/core';
import * as nunjucks from 'nunjucks';

export default class Gen extends Command {
  static description = 'generate fluentbit configuration'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  public async run(): Promise<void> {
    const {} = await this.parse(Gen);

    nunjucks.configure('templates', {
      autoescape: true,
    });
    console.log(nunjucks.render('fluent-bit.conf.njk', {
      FLUENT_HOME: 'bar',
    }));

    // Do something
  }
}
