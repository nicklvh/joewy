import { rateLimit } from '@lib/api';
import { ApplyOptions } from '@sapphire/decorators';
import {
  methods,
  Route,
  type ApiRequest,
  type ApiResponse,
} from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
  route: 'hello-world',
})
export class HelloWorldRoute extends Route {
  @rateLimit(5000)
  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    response.json({ message: 'Hello World' });
  }

  @rateLimit(5000)
  public [methods.POST](_request: ApiRequest, response: ApiResponse) {
    response.json({ message: 'Hello World' });
  }
}
