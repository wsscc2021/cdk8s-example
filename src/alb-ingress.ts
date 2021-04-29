import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { KubeIngressV1Beta1 } from "../imports/k8s";
// import { KubeService } from "../imports/k8s";

export class AlbIngressChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}, applications: any = {} ) {
    super(scope, id, props)
    new KubeIngressV1Beta1(this, 'alb-ingress', {
      metadata: {
        annotations: {
          'kubernetes.io/ingress.class': 'alb',
          'alb.ingress.kubernetes.io/scheme': 'internet-facing',
          'alb.ingress.kubernetes.io/listen-ports': '[{"HTTP":80}]',
          'alb.ingress.kubernetes.io/target-type': 'ip',
          'alb.ingress.kubernetes.io/healthcheck-path': '/healthcheck'
        }
      },
      spec: {
        rules: [
          {
            http: {
              paths: [
                {
                  path: '/*',
                  backend: {
                    serviceName: `${applications['webapp-loadtest-demo']['info']['name']}-service`,
                    servicePort: applications['webapp-loadtest-demo']['info']['port']
                  }
                }
              ]
            }
          }
        ]
      }
    })
  }
}