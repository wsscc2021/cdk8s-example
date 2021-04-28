import { App, } from 'cdk8s';
import { AlbIngressChart } from './src/alb-ingress';
import { Application } from './src/application';

const app = new App();
const applications = {
  'webapp-loadtest-demo': new Application(app, 'webapp-loadtest-demo', {namespace:'app'}),
}
new AlbIngressChart(app, 'alb-ingress', {namespace: 'app'}, applications)

app.synth();
