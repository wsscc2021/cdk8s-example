import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { KubeDeployment, KubeHorizontalPodAutoscaler, KubeService } from "../imports/k8s";

export class Application {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    const info = {
      image: '242593025403.dkr.ecr.us-east-1.amazonaws.com/webapp-loadtest-demo:0.0.4-SNAPSHOT',
      label: {
        'app.kubernetes.io/name': 'webapp-loadtest-demo',
        'app.kubernetes.io/version': '0.0.4-SNAPSHOT'
      },
      limit: {
        cpu: '1000m',
        memory: '2000Mi'
      },
      port: 8080,
      name: 'webapp-loadtest-demo'
    }
    
    new DeploymentChart(scope, `${id}-deployment`, props, info)
    new HpaChart(scope, `${id}-hpa`, props, info)
    new ServiceChart(scope, `${id}-service`, props, info)
  }
}

class DeploymentChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }, info: any) {
    super(scope, id, props);

    // write code here

    new KubeDeployment(this, 'webapp-loadtest-demo', {
      spec: {
        replicas: 2,
        selector: {
          matchLabels: info.label
        },
        template: {
          metadata: {
            labels: info.label
          },
          spec: {
            terminationGracePeriodSeconds: 60,
            containers: [
              {
                name: info.name,
                image: info.image,
                ports: [ { containerPort: info.port }],
                resources: {
                  requests: {
                    cpu: info.limit.cpu,
                    memory: info.limit.memory
                  },
                  limits: {
                    cpu: info.limit.cpu,
                    memory: info.limit.memory
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

class HpaChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }, info: any) {
    super(scope, id, props);

    // write code here
    new KubeHorizontalPodAutoscaler(this, 'webapp-loadtest-demo-hpa', {
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: info.name
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

class ServiceChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }, info: any) {
    super(scope, id, props);

    // write code here
    new KubeService(this, 'webapp-loadtest-demo-service', {
      spec: {
        selector: info.label,
        type: 'ClusterIP',
        ports: [
          {
            port: info.port,
            targetPort: info.port
          }
        ]
      }
    })
  }
}