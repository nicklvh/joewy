import { authenticated, rateLimit } from '#api/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import {
  Route,
  methods,
  type ApiRequest,
  type ApiResponse,
} from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
  route: 'test',
})
export class TestRoute extends Route {
  @rateLimit(5000, 1)
  @authenticated()
  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    return response.json({ message: 'Hello World!' });
  }

  @authenticated()
  public [methods.POST](_request: ApiRequest, response: ApiResponse) {
    return response.json({ message: 'Hello World!' });
  }
}
