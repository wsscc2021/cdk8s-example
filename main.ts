import { App, } from 'cdk8s';
import { AlbIngressChart } from './src/alb-ingress';
import { Application } from './src/application';
import { AppMeshIngressGateway } from './src/appmesh-ingress-gateway';

const app = new App();
const applications = {
  'sample-app-foo-v1': new Application(app, 'sample-app-foo-v1', {namespace:'app'}, {
    name: 'sample-app-foo-v1',
    image: '242593025403.dkr.ecr.us-west-2.amazonaws.com/sample-app-foo:v1',
    serviceAccountName: 'appmesh-envoy-access',
    label: {
      'app.kubernetes.io/name': 'sample-app-foo',
      'app.kubernetes.io/version': 'v1'
    },
    limit: {
      'cpu': '500m',
      'memory': '2000Mi'
    },
    port: 8080
  }),
  'sample-app-foo-v2': new Application(app, 'sample-app-foo-v2', {namespace:'app'}, {
    name: 'sample-app-foo-v2',
    image: '242593025403.dkr.ecr.us-west-2.amazonaws.com/sample-app-foo:v2',
    serviceAccountName: 'appmesh-envoy-access',
    label: {
      'app.kubernetes.io/name': 'sample-app-foo',
      'app.kubernetes.io/version': 'v2'
    },
    limit: {
      'cpu': '500m',
      'memory': '2000Mi'
    },
    port: 8080
  }),
  'sample-app-bar-v1': new Application(app, 'sample-app-bar-v1', {namespace:'app'}, {
    name: 'sample-app-bar-v1',
    image: '242593025403.dkr.ecr.us-west-2.amazonaws.com/sample-app-bar:v1',
    serviceAccountName: 'appmesh-envoy-access',
    label: {
      'app.kubernetes.io/name': 'sample-app-bar',
      'app.kubernetes.io/version': 'v1'
    },
    limit: {
      'cpu': '500m',
      'memory': '2000Mi'
    },
    port: 8080
  }),
  'sample-app-ingress-gw-v1': new AppMeshIngressGateway(app, 'sample-app-ingress-gw-v1', {namespace:'app'}, {
    serviceAccountName: 'appmesh-virtual-gateway',
    name: 'sample-app-ingress-gw-v1',
    image: '840364872350.dkr.ecr.us-west-2.amazonaws.com/aws-appmesh-envoy:v1.17.2.0-prod',
    label: {
      'app.kubernetes.io/name': 'sample-app-ingress-gw',
      'app.kubernetes.io/version': 'v1'
    },
    limit: {
      'cpu': '100m',
      'memory': '100Mi'
    },
    port: 8088
  }),
}

new AlbIngressChart(app, 'alb-ingress', {namespace: 'app'}, applications)

app.synth();
