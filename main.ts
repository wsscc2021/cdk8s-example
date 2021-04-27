import { App, } from 'cdk8s';
import { Application } from './src/webapp-loadtest-demo';

const app = new App();
new Application(app, 'webapp-loadtest-demo', {namespace:'app'});
app.synth();
