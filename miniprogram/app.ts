import AppContext, { AppOption } from './utils/app_context';

const context = new AppContext();

App<AppOption>({
  context: context,
  onLaunch() {
    (async () => {
      console.debug('App launched, getting global config...');
      const config = await context.getGlobalConfigCached();
      console.debug(`Global config: ${JSON.stringify(config)}`);
    })();
  },
})
