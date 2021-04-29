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
          'alb.ingress.kubernetes.io/listen-ports': '[{"HTTPS":443}]',
          'alb.ingress.kubernetes.io/certificate-arn': 'arn:aws:acm:us-west-2:242593025403:certificate/99e510d8-fe48-423a-81e2-d647dab91235',
          'alb.ingress.kubernetes.io/ssl-policy': 'ELBSecurityPolicy-2016-08',
          'alb.ingress.kubernetes.io/security-groups': 'sg-0bcaa7d07a79af115',
          'alb.ingress.kubernetes.io/target-type': 'ip',
          'alb.ingress.kubernetes.io/backend-protocol': 'HTTP',
          'alb.ingress.kubernetes.io/healthcheck-path': '/healthcheck',
          'alb.ingress.kubernetes.io/healthcheck-interval-seconds': '15',
          'alb.ingress.kubernetes.io/healthcheck-timeout-seconds': '5',
          'alb.ingress.kubernetes.io/healthy-threshold-count': '2',
          'alb.ingress.kubernetes.io/unhealthy-threshold-count': '2',
          'alb.ingress.kubernetes.io/target-group-attributes': 'slow_start.duration_seconds=30,deregistration_delay.timeout_seconds=60',
          'external-dns.alpha.kubernetes.io/ttl': '60',
          'external-dns.alpha.kubernetes.io/hostname': 'sample.skill53.cloud'
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