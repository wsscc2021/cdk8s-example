import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { KubeDeployment, KubeHorizontalPodAutoscaler } from "../imports/k8s";

export class DeploymentChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    // write code here
    const label = {
      'app.kubernetes.io/name': 'webapp-loadtest-demo',
      'app.kubernetes.io/version': '0.0.4-SNAPSHOT'
    }

    new KubeDeployment(this, 'webapp-loadtest-demo', {
      spec: {
        replicas: 2,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: {
            labels: label
          },
          spec: {
            terminationGracePeriodSeconds: 60,
            containers: [
              {
                name: 'webapp-loadtest-demo',
                image: '242593025403.dkr.ecr.us-east-1.amazonaws.com/webapp-loadtest-demo:0.0.4-SNAPSHOT',
                ports: [ { containerPort: 8080 }],
                resources: {
                  requests: {
                    cpu: '1000m',
                    memory: '2000Mi'
                  },
                  limits: {
                    cpu: '1000m',
                    memory: '2000Mi'
                  }
                },
                readinessProbe: {
                  httpGet: {
                    path: '/healthcheck/readiness',
                    port: 8080
                  },
                  initialDelaySeconds: 15,
                  periodSeconds: 10,
                  timeoutSeconds: 5,
                  successThreshold: 2,
                  failureThreshold: 3
                },
                livenessProbe: {
                  httpGet: {
                    path: '/healthcheck/liveness',
                    port: 8080
                  },
                  initialDelaySeconds: 45,
                  periodSeconds: 10,
                  timeoutSeconds: 5,
                  successThreshold: 1,
                  failureThreshold: 3
                }
              }
            ]
          }
        }
      }
    })
  }
}

export class HpaChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    // write code here
    new KubeHorizontalPodAutoscaler(this, 'webapp-loadtest-demo-hpa', {
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: 'webapp-loadtest-demo'
        },
        minReplicas: 2,
        maxReplicas: 20,
        metrics: [
          {
            type: 'Resource',
            resource: {
              name: 'cpu',
              target: {
                type: 'Utilization',
                averageUtilization: 50
              }
            }
          },
          {
            type: 'Resource',
            resource: {
              name: 'memory',
              target: {
                type: 'Utilization',
                averageValue: '1000Mi'
              }
            }
          }
        ]
      }
    })
  }
}
