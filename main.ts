import { App, } from 'cdk8s';
import { AlbIngressChart } from './src/alb-ingress';
import { Application } from './src/application';

const app = new App();
const applications = {
  'sample-app-foo-v1': new Application(app, 'sample-app-foo-v1', {namespace:'app'}, {
    name: 'sample-app-foo-v1',
    image: '242593025403.dkr.ecr.us-west-2.amazonaws.com/sample-app-foo:v1',
    label: {
      'app.kubernetes.io/name': 'sample-app-foo',
      'app.kubernetes.io/version': 'v1'
    },
    limit: {
      'cpu': '1000m',
      'memory': '2000Mi'
    },
    port: 8080
  }),
  'sample-app-bar-v1': new Application(app, 'sample-app-bar-v1', {namespace:'app'}, {
    name: 'sample-app-bar-v1',
    image: '242593025403.dkr.ecr.us-west-2.amazonaws.com/sample-app-bar:v1',
    label: {
      'app.kubernetes.io/name': 'sample-app-bar',
      'app.kubernetes.io/version': 'v1'
    },
    limit: {
      'cpu': '1000m',
      'memory': '2000Mi'
    },
    port: 8080
  }),
}

new AlbIngressChart(app, 'alb-ingress', {namespace: 'app'}, applications)

app.synth();
