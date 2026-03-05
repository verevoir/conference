export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { NodeSDK } = await import('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } =
    await import('@opentelemetry/auto-instrumentations-node');

  const isProd = process.env.NODE_ENV === 'production';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let traceExporter: any;
  if (isProd) {
    const { TraceExporter } =
      await import('@google-cloud/opentelemetry-cloud-trace-exporter');
    traceExporter = new TraceExporter();
  }

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  });

  sdk.start();
}
