import { flags } from "@oclif/command";
import { table } from "heroku-cli-util";
import { introspectionFromSchema } from "graphql";

import { gitInfo } from "../../git";
import { ProjectCommand } from "../../Command";

export default class ServicePush extends ProjectCommand {
  static aliases = ["schema:publish"];
  static description = "Push a service to Engine";
  static flags = {
    ...ProjectCommand.flags,
    tag: flags.string({
      char: "t",
      description: "The published tag to check this service against",
      default: "current"
    })
  };

  async run() {
    let result;
    let gitContext;
    await this.runTasks(({ flags, project, config }) => [
      {
        title: "Uploading service to Engine",
        task: async () => {
          const schema = await project.resolveSchema({ tag: flags.tag });
          gitContext = await gitInfo();

          const { tag, code } = await project.engine.uploadSchema({
            id: config.name,
            schema: introspectionFromSchema(schema).__schema,
            tag: flags.tag,
            gitContext
          });

          result = {
            service: config.name,
            hash: tag.schema.hash,
            tag: tag.tag,
            code
          };
        }
      }
    ]);

    this.log("\n");
    if (result.code === "NO_CHANGES") {
      this.log("No change in schema from previous version\n");
    }
    table([result], {
      columns: [
        {
          key: "hash",
          label: "id",
          format: (hash: string) => hash.slice(0, 6)
        },
        { key: "service", label: "schema" },
        { key: "tag" }
      ]
    });
    this.log("\n");
  }
}
