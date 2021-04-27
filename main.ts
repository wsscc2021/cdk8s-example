import { App, } from 'cdk8s';
import { DeploymentChart, HpaChart } from './src/webapp-loadtest-demo';

const app = new App();
new DeploymentChart(app, 'deployment', {namespace:'app'});
new HpaChart(app, 'hpa', {namespace:'app'});
app.synth();
