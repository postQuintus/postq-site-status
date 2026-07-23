export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  import('@/lib/sampler').then(({ startSampler }) => startSampler())
}
