import {
  methods,
  Route,
  type ApiRequest,
  type ApiResponse,
} from "@sapphire/plugin-api";

import { container } from "@sapphire/framework";

export class GuildsRoute extends Route {
  public constructor(context: Route.Context, options: Route.Options) {
    super(context, {
      ...options,
      route: "guilds",
    });
  }

  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    const guilds = container.client.guilds.cache;
    response.json({ guilds });
  }
}
