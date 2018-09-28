export function initialize(application) {
  application.inject('adapter', 'config', 'service:config');
}

export default {
  name: 'config',
  initialize
};
