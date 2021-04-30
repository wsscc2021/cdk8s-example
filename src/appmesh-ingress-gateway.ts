import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { KubeDeployment, KubeHorizontalPodAutoscalerV2Beta2, KubeService } from "../imports/k8s";

interface ApplicationProps {
  serviceAccountName: string
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

export class AppMeshIngressGateway {
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
            serviceAccountName: info.serviceAccountName,
            terminationGracePeriodSeconds: 60,
            containers: [
              {
                name: 'envoy',
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