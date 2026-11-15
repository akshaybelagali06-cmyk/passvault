import services from '@/data/services.json';
import { ENTRY_CATEGORIES, type ServiceDefinition } from '@/types/vault';

const catalog = services as ServiceDefinition[];

test('bundled service catalog stays offline and structured', () => {
  expect(catalog.length).toBeGreaterThanOrEqual(50);
  expect(catalog.length).toBeLessThanOrEqual(100);

  for (const service of catalog) {
    expect(service.name).toEqual(expect.any(String));
    expect(service.domain).toEqual(expect.any(String));
    expect(service.brandColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(ENTRY_CATEGORIES).toContain(service.defaultCategory);
  }
});
