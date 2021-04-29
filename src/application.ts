import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { KubeDeployment, KubeHorizontalPodAutoscalerV2Beta2, KubeService } from "../imports/k8s";

interface ApplicationProps {
  name: string
  image: string
  label: {
    'app.kubernetes.io/name': string,
    'app.kubernetes.io/version': string
  }
  limit: {
    'cpu': string,
    'memory': string
  }
  port: number
}

export class Application {
  constructor(scope: Construct, id: string, props: ChartProps = { }, info: ApplicationProps) {    
    const deployment = new DeploymentChart(scope, `${id}-deployment`, props, info)
    const hpa        = new HpaChart(scope, `${id}-hpa`, props, info)
    const service    = new ServiceChart(scope, `${id}-service`, props, info)
    return {info, deployment, hpa, service}
  }
}

class DeploymentChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }, info: any) {
    super(scope, id, props);

    // write code here

    new KubeDeployment(this, `${info.name}-deployment`, {
      metadata: {
        name: `${info.name}-deployment`
      },
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
    new KubeHorizontalPodAutoscalerV2Beta2(this, `${info.name}-hpa`, {
      metadata: {
        name: `${info.name}-hpa`
      },
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
    new KubeService(this, `${info.name}-service`, {
      metadata: {
        name: `${info.name}-service`
      },
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